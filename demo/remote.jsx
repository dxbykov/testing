import React from 'react'
import { GridContainer, GridView, Cell, Pager, Grouper, sorty } from '../src/index'

import {
    sortingStateController,
    groupStateController,
    pagingStateController,
} from '../src/data/controllers'

import {
    dataSortingController,
    dataGroupingController,
    dataPagingController,
    pagingHelper
} from '../src/data/processors'

export function fakeRemoteDataSource(getProps, setState) {
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

    let sort = dataSortingController(() => {
        return {
            originalRows: data,
            sortings: getProps().sortings
        };
    });

    let group = dataGroupingController(() => {
        return {
            originalRows: sort(),
            grouping: getProps().grouping
        }
    });

    let paginate = dataPagingController(() => {
        return {
            originalRows: group(),
            pageSize: getProps().pageSize,
            page: getProps().page
        };
    });

    let load = () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve({
                        visibleRows: paginate(),
                        totalCount: group().length
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

        this.setState = this.setState.bind(this);
        this.refreshData = this.refreshData.bind(this);

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

        this.dataSource = fakeRemoteDataSource(() => {
                return {
                    sortings: this.state.sortings,
                    grouping: this.state.grouping,
                    pageSize: this.state.pageSize,
                    page: this.state.page,
                    totalCount: this.state.totalCount
                }
            }, 
            this.setState);

        // control state

        const getState = () => this.state,
            setState = (state) => this.setState(state, this.refreshData);

        this.sortingCtrl = sortingStateController(getState, setState);
        this.groupingCtrl = groupStateController(getState, setState);
        this.pagingCtrl = pagingStateController(getState, setState);

    }
    
    componentDidMount() {
        this.refreshData();
    }

    refreshData() {
        this.dataSource.reload();
    }
    
    render() {
        return (
            <div>
                {this.state.loading ? "Loading...": "Ready"}
                <Grouper 
                    columns={this.state.columns} 
                    grouping={this.state.grouping}
                    groupChange={this.groupingCtrl.groupChange}
                />
                <GridView
                    columns={this.state.columns}
                    rows={this.state.visibleRows}
                    sortings={this.state.sortings}
                    onSort={this.sortingCtrl.onSort}
                    cellTemplate={({ rowIndex, columnIndex, data }) => <Cell key={columnIndex}>[{rowIndex},{columnIndex}] {data}</Cell>}
                    footerTemplate={
                        <Pager
                            page={this.state.page}
                            pageSize={this.state.pageSize}
                            totalCount={this.state.totalCount}
                            pageChange={this.pagingCtrl.pageChange}
                            pageSizeChange={this.pagingCtrl.pageSizeChange}
                        />
                    }
                />
            </div>
        );
    }
};