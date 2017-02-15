import React from 'react'
import { GridContainer, GridView, Cell, Pager, Grouper, sorty } from '../src/index'

// state controllers

function sortingStateController({ getProps, setState }) {
    let calcSortings = (columnName, prevSortings) => {
        let sorting = prevSortings.filter(s => { return s.column == columnName; })[0];
        return [ { column: columnName, direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc' } ]
    };

    return {
        props: () => {
            return {
                onSort: (columnName) => {
                    let { sortings } = getProps(),
                        nextSortings = calcSortings(columnName, sortings);

                    setState({ sortings: nextSortings });
                }
            };
        }
    };
}

function groupStateController({ getProps, setState }) {
    return {
        props: () => {
            return {
                groupChange: (columnName) => {
                    let grouping = getProps().grouping,
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
    };
}

function pagingStateController({ getProps, setState }) {
    let page = ({ totalCount, pageSize, page }) => {
        let totalPages = Math.ceil(totalCount / pageSize),
            lastPageIndex = totalPages - 1;

        return (lastPageIndex < page) ? lastPageIndex : page;
    };

    return {
        props: () => {
            return {
                pageChange: (page) => {
                    setState({ page });
                },
                pageSizeChange: (pageSize) => {
                    setState({ pageSize });
                },
                page: page(getProps())
            };
        }
    };
}

// data processing

function dataSortingController({ getProps }) {
    let sort = ({ originalRows, sortings }) => {
        return sorty(originalRows, sortings);
    };

    return {
        props: () => {
            return {
                sortedRows: sort(getProps())
            };
        }
    };
}

function dataPagingController({ getProps }) {
    let paginate = ({ originalRows, pageSize, page }) => {
        let visibleRows = originalRows.slice(pageSize * page, pageSize * (page + 1));
        return visibleRows;
    };
    return  {
        props: () => {
            return {
                visibleRows: paginate(getProps())
            };
        }
    };
}

function groupDataController({ getProps }) {
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

    return  {
        props: () => {
            let props = getProps();
            return {
                groupedRows: group(props.originalRows, props.grouping)
            };
        }
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
            getProps: () => {
                return {
                    sortings: this.state.sortings
                };
            },
            setState:({ sortings }) => {
                this.setState({ sortings });
            }
        });


        this.groupingState = groupStateController({
            getProps: () => {
                return {
                    grouping: this.state.grouping
                }
            },
            setState: (nextState) => {
                this.setState(nextState);
            }
        });

        this.pagingState = pagingStateController({
            getProps: () => {
                return {
                    pageSize: this.state.pageSize,
                    page: this.state.page,
                    totalCount: this.group.props().groupedRows.length
                };
            },
            setState: (nextState) => {
                this.setState(nextState);
            }
        });

        // process data

        this.sort = dataSortingController({
            getProps: () => {
                return {
                    originalRows: this.state.originalRows,
                    sortings: this.state.sortings
                };
            }
        });

        this.group = groupDataController({
            getProps: () => {
                return {
                    originalRows: this.sort.props().sortedRows,
                    grouping: this.state.grouping
                }
            }
        });

        this.page = dataPagingController({
            getProps: () => {
                return {
                    originalRows: this.group.props().groupedRows,
                    pageSize: this.state.pageSize,
                    page: this.pagingState.props().page
                };
            }
        });

    }

    render() {
        return (
            <div>
                <Grouper columns={this.state.columns} grouping={this.state.grouping} {...this.groupingState.props(/*mapper*/)} />
                <GridView
                    columns={this.state.columns}
                    rows={this.page.props().visibleRows}
                    sortings={this.state.sortings}
                    {...this.sortingState.props(/*mapper*/)}
                    cellTemplate={({ rowIndex, columnIndex, data }) => <Cell key={columnIndex}>[{rowIndex},{columnIndex}] {data}</Cell>}
                    footerTemplate={
                        <Pager 
                            pageSize={this.state.pageSize}
                            totalCount={this.group.props().groupedRows.length}
                            {...this.pagingState.props()}
                        />
                    }
                />
            </div>
        );
    }
};