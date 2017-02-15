import React from 'react'
import { GridContainer, GridView, Cell, Pager, Grouper, sorty } from '../src/index'
import {
    sortingStateController,
    groupStateController,
    pagingStateController,
    dataSortingController,
    dataGroupingController,
    dataPagingController
    } from '../src/controllers'

export function fakeRemoteDataSource({ getProps, setState }) {
    let data = [
        { id: 1, name: 'Bob', sex: 'Male', city: 'Los Angeles'},
        { id: 2, name: 'Alberta', sex: 'Female', city: 'New York'},
        { id: 3, name: 'Robert', sex: 'Male', city: 'Los Angeles'},
        { id: 4, name: 'Jane', sex: 'Female', city: 'Los Angeles'},
        { id: 5, name: 'Azbest', sex: 'Male', city: 'New York'},
        { id: 6, name: 'Vova', sex: 'Male', city: 'New York'},
        { id: 7, name: 'Sonya', sex: 'Female', city: 'Los Angeles'},
        { id: 8, name: 'Marry', sex: 'Female', city: 'New York'},
        { id: 9, name: 'Sherlock', sex: 'Male', city: 'New York'}
    ];

    let sort = dataSortingController({
        getProps: () => {
            return {
                originalRows: data,
                sortings: getProps().sortings
            };
        }
    });

    let group = dataGroupingController({
        getProps: () => {
            return {
                originalRows: sort.props().sortedRows,
                grouping: getProps().grouping
            }
        }
    });

    let paginate = dataPagingController({
        getProps: () => {
            return {
                originalRows: group.props().groupedRows,
                pageSize: getProps().pageSize,
                page: getProps().page
            };
        }
    });

    let load = () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({
                        visibleRows: paginate.props().visibleRows,
                        totalCount: group.props().groupedRows.length
                    });
                }, 500);
            });
    };

    return {
        reload: () => {
            setState({ loading: true });
            load(getProps()).then(({visibleRows, totalCount}) => {
                setState({
                    visibleRows,
                    totalCount,
                    loading: false
                });
            });
        }
    };
}

export class Remote extends React.Component {
    constructor() {
        super();

        this.state = {
            columns: [
                { name: 'id' },
                { name: 'name' },
                { name: 'sex' },
                { name: 'city' },
            ],
            visibleRows: [],
            totalCount: 0,
            sortings: [ { column: 'name', direction: 'asc' } ],
            grouping: [ { column: 'sex' } ],
            pageSize: 10,
            page: 0,
        };

        this.dataSource = fakeRemoteDataSource({
            getProps: () => {
                return {
                    sortings: this.state.sortings,
                    grouping: this.state.grouping,
                    pageSize: this.state.pageSize,
                    page: this.pagingState.props().page
                }
            },
            setState: (nextState) => {
                this.setState(nextState);
            }
        });

        // control state

        this.sortingState = sortingStateController({
            getProps: () => {
                return {
                    sortings: this.state.sortings
                };
            },
            setState:({ sortings }) => {
                this.setState({ sortings }, () => { this.dataSource.reload(); });
            }
        });


        this.groupingState = groupStateController({
            getProps: () => {
                return {
                    grouping: this.state.grouping
                }
            },
            setState: (nextState) => {
                this.setState(nextState, () => { this.dataSource.reload(); });
            }
        });

        this.pagingState = pagingStateController({
            getProps: () => {
                return {
                    pageSize: this.state.pageSize,
                    page: this.state.page,
                    totalCount: this.state.totalCount
                };
            },
            setState: (nextState) => {
                this.setState(nextState, () => { this.dataSource.reload(); });
            }
        });

    }
    
    componentDidMount() {
        this.dataSource.reload();
    }

    render() {
        return (
            <div>
                {this.state.loading ? "Loading...": "Ready"}
                <Grouper columns={this.state.columns} grouping={this.state.grouping} {...this.groupingState.props(/*mapper*/)} />
                <GridView
                    columns={this.state.columns}
                    rows={this.state.visibleRows}
                    sortings={this.state.sortings}
                    {...this.sortingState.props(/*mapper*/)}
                    cellTemplate={({ rowIndex, columnIndex, data }) => <Cell key={columnIndex}>[{rowIndex},{columnIndex}] {data}</Cell>}
                    footerTemplate={
                        <Pager 
                            pageSize={this.state.pageSize}
                            totalCount={this.state.totalCount}
                            {...this.pagingState.props()}
                        />
                    }
                />
            </div>
        );
    }
};