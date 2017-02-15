import React from 'react'
import { GridContainer, GridView, Cell, Pager, Grouper } from '../src/index'
import {
    sortingStateController,
    groupStateController,
    pagingStateController,
    dataSortingController,
    dataGroupingController,
    dataPagingController
    } from '../src/controllers'

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

        this.group = dataGroupingController({
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