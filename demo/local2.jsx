import React from 'react'
import { GridContainer, GridView, Cell, Pager, Grouper } from '../src/index'
import {
    sortingStateController,
    groupStateController,
    pagingStateController,
    dataSortingController,
    dataGroupingController,
    dataPagingController,
    pagingHelper
    } from '../src/controllers2'

export class Local extends React.Component {
    constructor() {
        super();
        
        this.setState = this.setState.bind(this);

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

        // control state

        const getState = () => this.state;

        this.sortingCtrl = sortingStateController(getState, this.setState);
        this.groupingCtrl = groupStateController(getState, this.setState);
        this.pagingCtrl = pagingStateController(getState, this.setState);

        // process data

        this.currentPage = () => {
            return pagingHelper.getCurrentPage(this.groupedRows().length,this.state.pageSize, this.state.page);
        };

        const sortedRows = dataSortingController(() => {
            return {
                originalRows: this.state.originalRows,
                sortings: this.state.sortings
            };
        });

        this.groupedRows = dataGroupingController(() => {
            return {
                originalRows: sortedRows(),
                grouping: this.state.grouping
            };
        });

        this.visibleRows = dataPagingController(() => {
            return {
                originalRows: this.groupedRows(),
                pageSize: this.state.pageSize,
                page: this.currentPage()
            };
        });

    }

    render() {
        return (
            <div>
               <Grouper 
                    columns={this.state.columns} 
                    grouping={this.state.grouping}
                    groupChange={this.groupingCtrl.groupChange}
                />
                <GridView
                    columns={this.state.columns}
                    rows={this.visibleRows()}
                    sortings={this.state.sortings}
                    onSort={this.sortingCtrl.onSort}
                    cellTemplate={({ rowIndex, columnIndex, data }) => <Cell key={columnIndex}>[{rowIndex},{columnIndex}] {data}</Cell>}
                    footerTemplate={
                        <Pager
                            page={this.currentPage()}
                            pageSize={this.state.pageSize}
                            totalCount={this.groupedRows().length}
                            pageChange={this.pagingCtrl.pageChange}
                            pageSizeChange={this.pagingCtrl.pageSizeChange}
                        />
                    }
                />
            </div>
        );
    }
};