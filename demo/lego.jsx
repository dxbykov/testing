import React from 'react';

import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import HTML5Backend, { NativeTypes } from 'react-dnd-html5-backend';

import {
    Portal,
    Grid, RowProvider, Cells, CellProvider, Cell,
    SortableCell, SelectableCell, ResizableCell, DraggableCell, DetailCell, DetailCellProvider,
    DetailColumnProvider, SelectableColumnProvider,
    HeadingRowProvider, DetailRow, DetailRowProvider, GroupRow, GroupRowProvider
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
        let onMove = (column, destination) => {
            let start = columns.indexOf(column);
            let end = columns.indexOf(destination);
            columns.splice(start, 1);
            columns.splice(end, 0, column);
            this.setState({ columns });
        };

        return (
            <DGrid
                getGrid={() => this.grid}
                onMove={onMove}>
                <Grid
                    ref={ref => this.grid = ref}
                    columns={[{ type: 'select' }].concat(columns)}
                    rows={[generateHeaderRow()].concat(sort(rows, sortings))}>
                    <HeadingRowProvider/>

                    <SelectableColumnProvider
                        isSelected={this.selectionCtrl.isSelected}
                        selectedChange={this.selectionCtrl.selectedChange}/>

                    <CellProvider
                        predicate={({ row }) => row.type === 'heading'}
                        preserve={() => true}
                        template={({ column, data }) => {
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
                        }}/>
                    <CellProvider
                        predicate={({ row, column }) => row.type === 'heading' && column.resizable === false}
                        preserve={() => true}
                        template={({ row, column, data }) => (
                            <DraggableCell
                                column={column}>
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
                            </DraggableCell>
                        )}/>
                    <CellProvider
                        predicate={({ row, column }) => row.type === 'heading' && column.type === 'select'}
                        template={({ row, column, data }) => (
                            <SelectableCell
                                selected={selection.length === rows.length}
                                indeterminate={selection.length !== 0 && selection.length !== rows.length}
                                selectedChange={() => this.selectionCtrl.selectedAllChange(rows, row => row.id)}
                                style={{ 
                                    borderBottom: 'none'
                                }}/>
                        )}/>
                </Grid>
            </DGrid>
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
                rows={rows}>
                <DetailRowProvider
                    isExpanded={isExpanded}
                    collapsedHeight={40}
                    expandedHeight={80}/>

                <DetailColumnProvider
                    isExpanded={isExpanded}
                    toggleExpanded={({ row }) => this.expandedCtrl.toggleExpanded(row.id)}/>
            </Grid>
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
            grouping: [{ column: 'sex' }]
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
                    rows={gridGroupShaper(group(rows, grouping))}>
                    <GroupRowProvider
                        isExpanded={({ row }) => this.expandedCtrl.isExpanded(keyGetter(row))}
                        toggleExpanded={({ row }) => this.expandedCtrl.toggleExpanded(keyGetter(row))}/>
                </Grid>
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
                    rows={[generateHeaderRow(), ...gridGroupShaper(group(rows, grouping))]}>
                    <GroupRowProvider
                        isExpanded={({ row }) => this.expandedCtrl.isExpanded(keyGetter(row))}
                        toggleExpanded={({ row }) => this.expandedCtrl.toggleExpanded(keyGetter(row))}/>
                    <HeadingRowProvider/>
                </Grid>
            </div>
        )
    }
}

@DropTarget('column', {
    drop(props, monitor) {
        let columnName = monitor.getItem().column;
        if(!props.grouping.filter(g => g.column === columnName).length)
            props.groupChange(monitor.getItem().column);
    },
}, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
}))
class DGrouper extends React.Component {
    render() {
        let { grouping, connectDropTarget } = this.props;

        return (
            connectDropTarget(<div style={{ border: '1px solid black', marginBottom: '5px', minHeight: '30px' }}>
                {grouping.map((group, groupIndex) =>
                    <DGrouperItem
                        key={group.column}
                        group={group}/>
                )}
            </div>)
        );
    }
}

@DragSource('column', {
    beginDrag: (props) => {
        const item = { column: props.group.column }
        return item;
    },
    endDrag: (props, monitor, component) => {
        if (!monitor.didDrop()) return;
    }
}, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
}))
class DGrouperItem extends React.Component {
    render() {
        let { group, isDragging, connectDragSource } = this.props;

        return connectDragSource(
            <div style={{ opacity: isDragging ? .4 : 1, userSelect: 'none', display: 'inline-block', border: '1px dotted black', padding: '8px' }}>
                {group.column}
            </div>
        );
    }
}

@DropTarget('column', {
    drop(props, monitor) {
        let columnName = monitor.getItem().column;
        if(props.grouping && props.grouping.filter(g => g.column === columnName).length) {
            props.groupChange(monitor.getItem().column);
        } else {
            let { columnAt, projectPoint, columns } = props.getGrid().host;
            let offset = monitor.getClientOffset();
            let currentColumn = columns.find(c => c.name === columnName);
            let destinationColumn = columnAt(projectPoint(offset));
            props.onMove(currentColumn, destinationColumn);
        }
    },
}, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
}))
class DGrid extends React.Component {
    render() {
        let { grouping, connectDropTarget, children } = this.props;

        return (
            connectDropTarget(<div>{children}</div>)
        );
    }
}

const calcCols = (rawColumns, grouping) => {
    return rawColumns.filter(c => grouping.findIndex(g => g.column === c.name) === -1);
}

class GroupedMasterDetailDemo extends React.Component {
    constructor(props) {
        super(props);

        let columns = generateColumns();
        let grouping = [{ column: 'name' }];

        this.state = {
            rawColumns: columns,
            columns: calcCols(columns, grouping),
            rows: generateRows(1000),
            grouping,
            expandedRows: [],
            expandedGroups: ['Marry'],
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
        let { rawColumns, columns, rows, grouping } = this.state;
        let visibleColumns = columns.filter(c => !grouping.filter(g => g.column === c.name).length);
        let isExpandedRow = ({ row }) => this.expandedRowsCtrl.isExpanded(row.id);
        let visibleRows = gridGroupShaper(group(rows, grouping));
        let keyGetter = (row) => (row.subvalue ? (row.subvalue + '_') : '') + row.value;
        let onMove = (column, destination) => {
            let start = rawColumns.indexOf(column);
            let end = rawColumns.indexOf(destination);
            rawColumns.splice(start, 1);
            rawColumns.splice(end, 0, column);
            this.setState({ rawColumns, columns: calcCols(rawColumns, grouping) });
        };
        let onGroup = (columnName) => {
            let existing = grouping.findIndex(g => g.column === columnName);
            if(existing === -1) {
                grouping = [{ column: columnName }, ...grouping];
                this.setState({ grouping, columns: calcCols(rawColumns, grouping) });
            } else {
                grouping = [...grouping.slice(0, existing), ...grouping.slice(existing + 1)];
                this.setState({ grouping, columns: calcCols(rawColumns, grouping) });
            }
        };

        return (
            <div>
                <DGrouper
                    grouping={grouping}
                    groupChange={onGroup}/>
                <DGrid
                    grouping={grouping}
                    groupChange={onGroup}
                    getGrid={() => this.grid}
                    onMove={onMove}>
                    <Grid
                        ref={ref => this.grid = ref}
                        columns={[{ type: 'detail' }, ...visibleColumns]}
                        rows={[generateHeaderRow(), ...visibleRows]}>
                        <DetailRowProvider
                            isExpanded={isExpandedRow}
                            collapsedHeight={40}
                            expandedHeight={80}/>
                        <GroupRowProvider
                            isExpanded={({ row }) => this.expandedGroupsCtrl.isExpanded(keyGetter(row))}
                            toggleExpanded={({ row }) => this.expandedGroupsCtrl.toggleExpanded(keyGetter(row))}/>
                        <HeadingRowProvider/>

                        <DetailColumnProvider
                            isExpanded={isExpandedRow}
                            toggleExpanded={({ row }) => this.expandedRowsCtrl.toggleExpanded(row.id)}/>

                        <CellProvider
                            predicate={({ row, column }) => row.type === 'heading'}
                            preserve={() => true}
                            template={({ row, column, data }) => (
                                <DraggableCell
                                    column={column}>
                                    <Cell>{data}</Cell>
                                </DraggableCell>
                            )}/>
                        <CellProvider
                            predicate={({ row, column }) => row.type === 'heading' && column.type === 'detail'}/>
                    </Grid>
                </DGrid>
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

@DragDropContext(HTML5Backend)
export class LegoDemo extends React.Component {
    render() {
        return (
            <div>
                <Box title="Simple" demo={SimpleDemo}/>
                <Box title="Simple w/ Heading, Sorting, Selection, Column Resizing, Column Reordering" demo={HeadingSortingSelectingDemo}/>
                <Box title="Simple w/ Paging" demo={PagingDemo}/>
                <Box title="Master Detail" demo={MasterDetailDemo}/>
                <Box title="Grouped" demo={GroupedDemo}/>
                <Box title="Nested Grouped with Heading" demo={NestedGroupedDemo}/>
                <Box title="Grouped Master Detail" demo={GroupedMasterDetailDemo}/>
            </div>
        )
    }
}