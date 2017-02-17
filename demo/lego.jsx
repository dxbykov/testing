import React from 'react';
import { 
    Grid,
    Cell, cellProvider, SortableCell, DetailCell, detailCellProvider,
    Row, rowProvider, headingRowProvider, DetailRow, detailRowProvider, GroupRow, groupRowProvider
} from '../src/lego';

import { Grouper } from '../src';

import {
    sortingStateController,
    groupStateController,
    pagingStateController,
    expandedStateController
} from '../src/data/controllers'

import {
    dataSortingController,
    dataGroupingController,
    dataPagingController,
    pagingHelper
} from '../src/data/processors'

import { generateColumns, generateHeaderRow, generateRows } from './demoData';

let generateData = (length, names, from = 0) => {
    let data = [];
    names = names || ['Bob', 'Albert', 'Robert', 'Poul', 'Azbest', 'Vova', 'Sonya', 'Marry', 'Sherlock'];
    for(let i = from; i < length + from; i++) {
        data.push({ id: i + 1, name: names[Math.floor(Math.random() * names.length)] })
    }
    return data;
}

class SimpleDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: generateColumns(),
            rows: generateRows(1000)
        };
    }

    render() {
        let { columns, rows } = this.state; 

        return (
            <Grid
                columns={columns}
                rows={rows}/>
        )
    }
}

class HeadingSortingDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: generateColumns(),
            rows: generateRows(1000),
            sortings: [{ column: 'id', direction: 'desc' }]
        }

        this.setState = this.setState.bind(this);
        this.sortingCtrl = sortingStateController(() => this.state, this.setState);

        this.sort = dataSortingController(() => {
            return {
                originalRows: this.state.rows,
                sortings: this.state.sortings
            };
        });

    }

    render() {
        let { columns, rows, sortings } = this.state;

        return (
            <Grid
                columns={columns}
                rows={[generateHeaderRow()].concat(this.sort())}
                cellProviders={[
                    cellProvider({
                        predicate: ({ row }) => row.type === 'heading',
                        template: ({ column, data }) => (
                            <SortableCell
                                direction={this.sortingCtrl.directionFor(column.name)}
                                directionChange={() => this.sortingCtrl.onSort(column.name)}>
                                { data }
                            </SortableCell>
                        )
                    })
                ]}
                rowProviders={[
                    headingRowProvider()
                ]}/>
        )
    }
}

class MasterDetailDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [{ type: 'detail' }, ...generateColumns()],
            rows: generateRows(1000),
            expandedRows: [3]
        };

        this.setState = this.setState.bind(this);
        this.expandedCtrl = expandedStateController(() => this.state, this.setState);
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = ({ row }) => this.expandedCtrl.isExpanded(row.id);
        return (
            <Grid
                columns={columns}
                rows={rows}
                cellProviders={[
                    detailCellProvider({
                        isExpanded,
                        toggleExpanded: ({ row }) => this.expandedCtrl.toggleExpanded(row.id)
                    })
                ]}
                rowProviders={[
                    detailRowProvider({
                        isExpanded,
                        collapsedHeight: 40,
                        expandedHeight: 80
                    })
                ]}/>
        )
    }
}

class GroupedDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: generateColumns(),
            rows: generateRows(200),
            expandedRows: ['Male'],
            grouping: [{column: 'sex'}]
        }

        this.setState = this.setState.bind(this);
        this.expandedCtrl = expandedStateController(() => this.state, this.setState);
        this.groupingCtrl = groupStateController(() => this.state, this.setState);

        this.group = dataGroupingController(() => {
            return {
                originalRows: this.state.rows,
                grouping: this.state.grouping
            };
        });
    }

    render() {
        let { columns } = this.state;
        return (
            <div>
               <Grouper 
                    columns={this.state.columns} 
                    grouping={this.state.grouping}
                    groupChange={this.groupingCtrl.groupChange}
                />
                <Grid
                    columns={columns}
                    rows={this.group()}
                    rowProviders={[
                        groupRowProvider({
                            isExpanded: ({ row }) => this.expandedCtrl.isExpanded(row.value),
                            toggleExpanded: ({ row }) => this.expandedCtrl.toggleExpanded(row.value)
                        })
                    ]}
                />
            </div>
        )
    }
}

class NestedGroupedDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: generateColumns(),
            rows: generateRows(200),
            expandedRows: ['Los Angeles', 'Moscow', 'Moscow_BMW'],
            grouping: [{column: 'city'}, {column: 'car'}]
        }

        this.setState = this.setState.bind(this);
        this.expandedCtrl = expandedStateController(() => this.state, this.setState);
        this.groupingCtrl = groupStateController(() => this.state, this.setState);

        this.group = dataGroupingController(() => {
            return {
                originalRows: this.state.rows,
                grouping: this.state.grouping
            };
        });
    }

    render() {
        let { columns } = this.state;
        let keyGetter = (row) => (row.subvalue ? (row.subvalue + '_') : '') + row.value;
        return (
            <div>
               <Grouper 
                    columns={this.state.columns} 
                    grouping={this.state.grouping}
                    groupChange={this.groupingCtrl.groupChange}
                />
                <Grid
                    columns={columns}
                    rows={[generateHeaderRow(), ...this.group()]}
                    rowProviders={[
                        groupRowProvider({
                            isExpanded: ({ row }) => this.expandedCtrl.isExpanded(keyGetter(row)),
                            toggleExpanded: ({ row }) => this.expandedCtrl.toggleExpanded(keyGetter(row))
                        }),
                        headingRowProvider()
                    ]}
                />
            </div>
        )
    }
}

class GroupedMasterDetailDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [{ type: 'detail', width: 40 }, ...generateColumns()],
            rows: generateRows(200),
            grouping: [{column: 'name'}],
            expandedRows: [],
            expandedGroups: ['Marry']
        }

        this.setState = this.setState.bind(this);
        this.expandedRowsCtrl = expandedStateController(() => this.state, this.setState);
        this.expandedGroupsCtrl = expandedStateController(
            () => {
                return { expandedRows: this.state.expandedGroups };
            },
            (state) => {
                this.setState({ expandedGroups: state.expandedRows });
            }
        );
        this.groupingCtrl = groupStateController(() => this.state, this.setState);

        this.group = dataGroupingController(() => {
            return {
                originalRows: this.state.rows,
                grouping: this.state.grouping
            };
        });
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = ({ row }) => this.expandedGroupsCtrl.isExpanded(row.value);
        let isExpandedRow = ({ row }) => this.expandedRowsCtrl.isExpanded(row.id);
        return (
            <div>
               <Grouper 
                    columns={this.state.columns} 
                    grouping={this.state.grouping}
                    groupChange={this.groupingCtrl.groupChange}
                />
                <Grid
                    columns={columns}
                    rows={[generateHeaderRow(), ...this.group()]}
                    cellProviders={[
                        detailCellProvider({
                            isExpanded: isExpandedRow,
                            toggleExpanded: ({ row }) => this.expandedRowsCtrl.toggleExpanded(row.id)
                        })
                    ]}
                    rowProviders={[
                        detailRowProvider({
                            isExpanded: isExpandedRow,
                            collapsedHeight: 40,
                            expandedHeight: 80
                        }),
                        groupRowProvider({
                            isExpanded,
                            toggleExpanded: ({ row }) => this.expandedGroupsCtrl.toggleExpanded(row.value)
                        }),
                        headingRowProvider()
                    ]}
                />
            </div>
        )
    }
}

class Box extends React.Component {
    render() {
        let Demo = this.props.demo;
        return (
            <div style={{ width: '500px', height: '480px', float: 'left', marginLeft: '20px' }}>
                <h2>{this.props.title}</h2>
                <Demo/>
            </div>
        );
    }
}

export class LegoDemo extends React.Component {
    render() {
        return (
            <div>
                <Box title="Simple" demo={SimpleDemo}/>
                <Box title="Simple w/ Heading, Sorting" demo={HeadingSortingDemo}/>
                <Box title="Master Detail" demo={MasterDetailDemo}/>
                <Box title="Grouped" demo={GroupedDemo}/>
                <Box title="Nested Grouped with Heading" demo={NestedGroupedDemo}/>
                <Box title="Grouped Master Detail" demo={GroupedMasterDetailDemo}/>
            </div>
        )
    }
}