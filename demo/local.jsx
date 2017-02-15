import React from 'react'
import { GridContainer, GridView, Cell, Pager, Grouper, sorty } from '../src/index'

// state controllers

function sortingStateController({ getState, setState }) {
    let calcSortings = (columnName, prevSortings) => {
        let sorting = prevSortings.filter(s => { return s.column == columnName; })[0];
        return [ { column: columnName, direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc' } ]
    };

    return {
        onSort: (columnName) => {
            let { sortings } = getState(),
                nextSortings = calcSortings(columnName, sortings);

            setState({ sortings: nextSortings });
        }
    };
}

function groupStateController({ getState, setState }) {
    return {
        groupChange: (columnName) => {
            let grouping = getState().grouping,
                colGrouping = grouping.filter(g => g.column === columnName)[0];

            grouping = grouping.slice();
            if(colGrouping) {
                grouping.splice(grouping.indexOf(colGrouping), 1);
            }
            else {
                grouping.push({
                    column: columnName
                });
            }
            setState({ grouping: grouping });
        }
    };
}

function pagingStateController({ getState, setState }) {
    return {
        pageChange: (page) => {
            setState({ page });
            setState((state, props) => {
                setState({ page });
            });
        },
        pageSizeChange: (pageSize) => {
            setState({ pageSize });
        },
        page: () => {
            let state = getState(),
                totalPages = Math.ceil(state.totalCount / state.pageSize),
                lastPageIndex = totalPages - 1;

            return (lastPageIndex < state.page) ? lastPageIndex : state.page;
        }
    };
}

// data processing

function dataSortingController({ getState }) {
    return () => {
        let { originalRows, sortings } = getState(),
            sortedRows = sorty(originalRows, sortings);

        return sortedRows;
    };
}

function dataPagingController({ getState }) {
    return () => {
        let { originalRows, pageSize, page } = getState(),
            visibleRows = originalRows.slice(pageSize * page, pageSize * (page + 1));
        
        return visibleRows;
    };
}

function groupDataController({ getState }) {
    let flatten = (rows) => {
        let result = [];
        
        rows.forEach(r => {
            if(r.isGroupRow) {
                let { rows, ...group } = r;
                result.push(group);
                if(rows) {
                    result.push.apply(result, flatten(rows));
                }
            }
            else {
                result.push(r);
            }
        });

        return result;
    };

    let group = (originalRows, grouping) => {
        if(!grouping.length) return originalRows;

        let rows = originalRows.slice(),
            groupColumn = grouping[0].column,
            nextGrouping = grouping.slice(1),
            result = [],
            groups = [],
            groupHash = {};

        originalRows.forEach(r => {
            let groupKey = r[groupColumn],
                group;

            if(groupKey in groupHash) {
                group = groupHash[groupKey];
            }
            else {
                groupHash[groupKey] = group = {
                    key: groupKey,
                    isGroupRow: true,
                    column: groupColumn,
                    rows: []
                };
                groups.push(group);
            }

            group.rows.push(r);
        });

        if(nextGrouping.length) {
            groups.forEach(g => {
                g.rows = group(g.rows, nextGrouping);
            });
        }

        return flatten(groups);
    };

    return () => {
        let { originalRows, grouping } = getState();
        return group(originalRows, grouping);
    };
}


export class Local extends React.Component {
    constructor() {
        super();

        this.state = {
            columns: [
                { name: 'id' },
                { name: 'name' },
                { name: 'sex' },
                { name: 'city' },
            ],
            originalRows: [
                { id: 1, name: 'Bob', sex: 'Male', city: 'Los Angeles'},
                { id: 2, name: 'Alberta', sex: 'Female', city: 'New York'},
                { id: 3, name: 'Robert', sex: 'Male', city: 'Los Angeles'},
                { id: 4, name: 'Jane', sex: 'Female', city: 'Los Angeles'},
                { id: 5, name: 'Azbest', sex: 'Male', city: 'New York'},
                { id: 6, name: 'Vova', sex: 'Male', city: 'New York'},
                { id: 7, name: 'Sonya', sex: 'Female', city: 'Los Angeles'},
                { id: 8, name: 'Marry', sex: 'Female', city: 'New York'},
                { id: 9, name: 'Sherlock', sex: 'Male', city: 'New York'}
            ],
            sortings: [ { column: 'name', direction: 'asc' } ],
            grouping: [ { column: 'sex' } ],
            pageSize: 10,
            page: 0,
        };

        //const originalRows = state => state.originalRows;

        // control state

        this.sortingState = sortingStateController({
            getState: () => {
                return {
                    sortings: this.state.sortings
                };
            },
            setState:({ sortings }) => {
                this.setState({ sortings });
            }
        });


        this.groupingState = groupStateController({
            getState: () => {
                return {
                    grouping: this.state.grouping
                }
            },
            setState: (nextState) => {
                this.setState(nextState);
            }
        });

        this.pagingState = pagingStateController({
            getState: () => {
                return {
                    pageSize: this.state.pageSize,
                    page: this.state.page,
                    totalCount: this.group().length
                };
            },
            setState: (nextState, callback) => {
                this.setState(nextState, callback);
            }
        });

        // process data

        this.sort = dataSortingController({
            getState: () => {
                return {
                    originalRows: this.state.originalRows,
                    sortings: this.state.sortings
                };
            }
        });

        this.group = groupDataController({
            getState: () => {
                return {
                    originalRows: this.sort(),
                    grouping: this.state.grouping
                }
            }
        });

        this.page = dataPagingController({
            getState: () => {
                return {
                    originalRows: this.group(),
                    pageSize: this.state.pageSize,
                    page: this.pagingState.page()
                };
            }
        });

        // this.visibleRows = () => this.group();
        // this.totalCount = () => this.visibleRows().length;

    }

    render() {
        return (
            <div>
                <Grouper columns={this.state.columns} grouping={this.state.grouping} groupChange={this.groupingState.groupChange} />
                <GridView
                    columns={this.state.columns}
                    rows={this.page()}
                    sortings={this.state.sortings}
                    onSort={this.sortingState.onSort}
                    cellTemplate={({ rowIndex, columnIndex, data }) => <Cell key={columnIndex}>[{rowIndex},{columnIndex}] {data}</Cell>}
                    footerTemplate={
                        <Pager 
                            pageSize={this.state.pageSize}
                            page={this.pagingState.page()}
                            totalCount={this.group().length}
                            pageChange={this.pagingState.pageChange}
                            pageSizeChange={this.pagingState.pageSizeChange}
                        />
                    }
                />
            </div>
        );
    }
};