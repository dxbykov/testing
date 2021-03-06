import React from 'react';
import {
    Grid,
    Cell, cellProvider, SortableCell, SelectableCell, ResizableCell, DetailCell, detailCellProvider,
    Row, rowProvider, headingRowProvider, DetailRow, detailRowProvider, GroupRow, groupRowProvider
} from '../src/lego';

import { Grouper, Pager } from '../src';

import {
    sortingStateController,
    groupStateController,
    expandedStateController,
    selectionStateController
} from '../src/data/controllers'

import {
    sort,
    group,
    gridGroupShaper,
    paginate
} from '../src/data/processors'

import { generateColumns, generateHeaderRow, generateRows } from './demoData';

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

class HeadingSortingSelectingDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: generateColumns(),
            rows: generateRows(1000),
            sortings: [{ column: 'id', direction: 'asc' }],
            selection: [2, 5, 300, 455, 998]
        }

        this.setState = this.setState.bind(this);
        this.sortingCtrl = sortingStateController(() => this.state, this.setState);
        this.selectionCtrl = selectionStateController(() => this.state, this.setState);
    }

    render() {
        let { columns, rows, sortings, selection } = this.state;

        return (
            <Grid
                columns={[{ type: 'select', width: 40 }].concat(columns)}
                rows={[generateHeaderRow()].concat(sort(rows, sortings))}
                cellProviders={[
                    cellProvider({
                        predicate: ({ row }) => row.type === 'heading',
                        template: ({ column, data }) => {
                            let onResize = (width) => {
                                columns[columns.indexOf(column)].width = width;
                                this.setState({ columns })
                            };

                            return (
                                <ResizableCell
                                    minWidth={column.minWidth}
                                    maxWidth={column.maxWidth}
                                    onResize={onResize}>
                                    <SortableCell
                                        direction={this.sortingCtrl.directionFor(column.name)}
                                        directionChange={() => this.sortingCtrl.onSort(column.name)}
                                        style={{
                                            height: '100%',
                                            borderBottom: 'none',
                                            borderRight: 'none',
                                        }}>
                                        {data}
                                    </SortableCell>
                                </ResizableCell>
                            )
                        }
                    }),
                    cellProvider({
                        predicate: ({ row, column }) => row.type === 'heading' && column.resizable === false,
                        template: ({ column, data }) => (
                            <SortableCell
                                direction={this.sortingCtrl.directionFor(column.name)}
                                directionChange={() => this.sortingCtrl.onSort(column.name)}>
                                {data}
                            </SortableCell>
                        )
                    }),
                    cellProvider({
                        predicate: ({ column }) => column.type === 'select',
                        stick: () => 'before',
                        template: ({ row, column, data }) => (
                            <SelectableCell
                                selected={this.selectionCtrl.isSelected(row.id)}
                                selectedChange={() => this.selectionCtrl.selectedChange(row.id)}
                                style={{ borderBottom: '1px dotted black' }}/>
                        )
                    }),
                    cellProvider({
                        predicate: ({ row, column }) => row.type === 'heading' && column.type === 'select',
                        stick: () => 'before',
                        template: ({ row, column, data }) => (
                            <SelectableCell
                                selected={selection.length === rows.length}
                                indeterminate={selection.length !== 0 && selection.length !== rows.length}
                                selectedChange={() => this.selectionCtrl.selectedAllChange(rows, row => row.id)}
                                style={{ 
                                    borderBottom: 'none'
                                }}/>
                        )
                    })
                ]}
                rowProviders={[
                    headingRowProvider()
                ]}/>
        )
    }
}

class PagingDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: generateColumns(),
            rows: generateRows(100),
            pageSize: 20,
            currentPage: 0
        };
    }

    render() {
        let { columns, rows, pageSize, currentPage } = this.state;

        return (
            <div>
                <Grid
                    columns={columns}
                    rows={paginate(rows, pageSize, currentPage)}/>
                <Pager
                    page={this.state.currentPage}
                    pageSize={this.state.pageSize}
                    totalCount={rows.length}
                    pageChange={currentPage => this.setState({ currentPage })}
                />                    
            </div>
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
            expandedRows: ['Male', 'Female'],
            grouping: [{column: 'sex'}]
        }

        this.setState = this.setState.bind(this);
        this.expandedCtrl = expandedStateController(() => this.state, this.setState);
        this.groupingCtrl = groupStateController(() => this.state, this.setState);
    }

    render() {
        let { columns, rows, grouping } = this.state;
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
                    rows={gridGroupShaper(group(rows, grouping))}
                    rowProviders={[
                        groupRowProvider({
                            isExpanded: ({ row }) => this.expandedCtrl.isExpanded(keyGetter(row)),
                            toggleExpanded: ({ row }) => this.expandedCtrl.toggleExpanded(keyGetter(row))
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
    }

    render() {
        let { columns, rows, grouping } = this.state;
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
                    rows={[generateHeaderRow(), ...gridGroupShaper(group(rows, grouping))]}
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
            expandedGroups: ['Marry'],
            pageSize: 20,
            currentPage: 0
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
    }

    render() {
        let { columns, rows, grouping } = this.state;
        let isExpanded = ({ row }) => this.expandedGroupsCtrl.isExpanded(row.value);
        let isExpandedRow = ({ row }) => this.expandedRowsCtrl.isExpanded(row.id);
        let visibleRows = gridGroupShaper(group(rows, grouping));

        return (
            <div>
               <Grouper 
                    columns={this.state.columns} 
                    grouping={this.state.grouping}
                    groupChange={this.groupingCtrl.groupChange}
                />
                <Grid
                    columns={columns}
                    rows={[generateHeaderRow(), ...visibleRows]}
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
                {/*<Pager
                    page={this.state.currentPage}
                    pageSize={this.state.pageSize}
                    totalCount={rows.length}
                    pageChange={currentPage => this.setState({ currentPage })}
                />*/}                   
           </div>
        )
    }
}

class Box extends React.Component {
    render() {
        let Demo = this.props.demo;
        return (
            <div style={{ width: '500px', height: '440px', float: 'left', marginLeft: '20px' }}>
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
                <Box title="Simple w/ Heading, Sorting, Selection, Column Resizing" demo={HeadingSortingSelectingDemo}/>
                <Box title="Simple w/ Paging" demo={PagingDemo}/>
                <Box title="Master Detail" demo={MasterDetailDemo}/>
                <Box title="Grouped" demo={GroupedDemo}/>
                <Box title="Nested Grouped with Heading" demo={NestedGroupedDemo}/>
                <Box title="Grouped Master Detail" demo={GroupedMasterDetailDemo}/>
            </div>
        )
    }
}