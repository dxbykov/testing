import React from 'react';

import { Action, Getter, GetterExtender, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { DataGrid, TableView, TableRowDetail } from '@devexpress/dx-react-datagrid';
import './magic.css';

import { generateColumns, generateRows } from './demoData';
import { defaultMemoize } from 'reselect'

const memoize = defaultMemoize;

// Core
const filterHelpers = {
    filter: (rows, filters) => {
        if(!filters.length)
            return rows;

        return rows.filter((row) => {
            return filters.reduce((accumulator, filter) => {
                return accumulator && String(row[filter.column]).toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
            }, true);
        });
    },
    filterFor: (columnName, filters) => {
        if(!filters.length)
            return '';
        let filter = filters.filter(s => s.column === columnName)[0];
        return filter ? filter.value : '';
    },
    calcFilters: ({ columnName, value }, filters) => {
        let filterIndex = filters.findIndex(f => { return f.column == columnName; });
        let nextState = filters.slice();
        if(filterIndex > -1) {
            nextState.splice(filterIndex, 1, { column: columnName, value: value });
        } else {
            nextState.push({ column: columnName, value: value })
        }
        return nextState;
    }
};

// UI
export class FilterState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            filters: props.defaultFilters || []
        };

        this.mRows = memoize((rows, filters) => filterHelpers.filter(rows, filters))
    }
    render() {
        return (
            <div>
                <Action name="setColumnFilter" action={({ columnName, value }, getter) => {
                    let { filtersChange } = this.props;
                    let filters = filterHelpers.calcFilters({ columnName, value }, getter('filters')());
                    this.setState({ filters });
                    filtersChange && filtersChange(filters);
                }} />

                <GetterExtender name="rows" value={(rows, getter) => (this.mRows)(rows, getter('filters')())}/>

                <Getter name="filters" value={this.props.filters || this.state.filters} />
                <Getter name="filterFor" value={(getter, { columnName }) => filterHelpers.filterFor(columnName, getter('filters')())} />
            </div>
        )
    }
};


export class FilterRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mTableHeaderRows = memoize((rows) => [...rows, { type: 'filter' }]);
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableHeaderRows" value={this.mTableHeaderRows}/>

                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'filter' && !column.type}
                    connectGetters={(getter, { column }) => ({
                        filter: getter('filterFor')({ columnName: column.name }),
                    })}
                    connectActions={(action, { column }) => ({
                        changeFilter: (value) => action('setColumnFilter')({ columnName: column.name, value }),
                    })}>
                    {({ filter, changeFilter }) => (
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => changeFilter(e.target.value)}
                            style={{ width: '100%' }}/>
                    )}
                </Template>
            </div>
        )
    }
};


export class HeaderRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mTableHeaderRows = memoize((rows, columns) => {
            return [columns.reduce((accum, c) => {
                accum[c.name] = c.title;
                return accum;
            }, { type: 'heading' }), ...rows]
        });
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableHeaderRows" value={(rows, getter) => (this.mTableHeaderRows)(rows, getter('columns')())}/>
            </div>
        )
    }
};


// Core
const sortingsHelper = {
    calcSortings: (columnName, prevSorting) => {
        let sorting = prevSorting.filter(s => { return s.column == columnName; })[0];
        return [
            {
                column: columnName,
                direction: (sorting && sorting.direction == 'asc') ? 'desc' : 'asc'
            }
        ];
    },
    directionFor: (columnName, sortings) => {
        let sorting = sortings.filter(s => s.column === columnName)[0];
        return sorting ? sorting.direction : false;
    },
    sort: (rows, sortings) => {
        if(!sortings.length)
            return rows;

        let sortColumn = sortings[0].column,
            result = rows.slice().sort((a, b) => {
                let value = (a[sortColumn] < b[sortColumn]) ^ sortings[0].direction === "desc"
                return value ? -1 : 1;
            });
        return result;
    },
};

// UI
export class SortingState extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mRows = memoize((rows, sortings) => sortingsHelper.sort(rows, sortings));
    }
    render() {
        let { sortings, sortingsChange } = this.props;
        
        return (
            <div>
                <Action name="applySorting" action={({ columnName, value }) => sortingsChange(sortingsHelper.calcSortings(columnName, sortings))} />

                <GetterExtender name="rows" value={(rows) => (this.mRows)(rows, sortings)}/>

                <Getter name="sortingFor" value={(_, { columnName }) => sortingsHelper.directionFor(columnName, sortings)} />
            </div>
        )
    }
};

const SortableCell = ({ direction, changeDirection, children }) => (
    <div 
        onClick={changeDirection}
        style={{ width: '100%', height: '100%' }}>
        {children} [{ direction ? (direction === 'desc' ? '↑' : '↓') : '#'}]
    </div>
);

export class HeaderRowSorting extends React.PureComponent {
    render() {
        return (
            <div>
                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'heading' && !column.type}
                    connectGetters={(getter, { column }) => ({
                        direction: getter('sortingFor')({ columnName: column.name }),
                    })}
                    connectActions={(action, { column }) => ({
                        changeDirection: () => action('applySorting')({ columnName: column.name }),
                    })}>
                    {({ direction, changeDirection }) => (
                        <SortableCell direction={direction} changeDirection={changeDirection}>
                            <TemplatePlaceholder />
                        </SortableCell>
                    )}
                </Template>
            </div>
        )
    }
};


// Core
const selectionHelpers = {
    calcSelection: (prevSelection, rowId) => {
        let selectedRows = prevSelection.slice(),
            selectedIndex = selectedRows.indexOf(rowId);
        
        if(selectedIndex > -1) {
            selectedRows.splice(selectedIndex, 1);
        } else if (selectedIndex === -1) {
            selectedRows.push(rowId)
        }

        return selectedRows;
    },
    toggleSelectAll: (prevSelection, rows, getRowId) => {
        if(prevSelection.length === rows.length) {
            return [];
        } else {
            return rows.map(getRowId);
        }
    },
};

// UI
const SelectCell = ({ selected, changeSelected }) => (
    <input
        type='checkbox'
        checked={selected}
        onChange={changeSelected}
        style={{ margin: '0' }}/>
);
const SelectAllCell = ({ allSelected, someSelected, toggleAll, rows }) => (
    <input
        type='checkbox'
        checked={allSelected}
        ref={(ref) => { ref && (ref.indeterminate = someSelected)}}
        onChange={() => toggleAll(rows)}
        style={{ margin: '0' }}/>
);

export class Selection extends React.PureComponent {
    constructor(props) {
        super(props);

        this.changeSelected = (rowId) => {
            let { selection, selectionChange } = this.props;
            selectionChange(selectionHelpers.calcSelection(selection, rowId))
        }
        this.toggleAllSelected = (rows) => {
            let { selection, selectionChange } = this.props;
            selectionChange(selectionHelpers.toggleSelectAll(selection, rows, (row) => row.id))
        }
        
        this.mColumns = memoize((columns) => [{ type: 'select', width: 20 }, ...columns]);
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableColumns" value={this.mColumns}/>

                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => column.type === 'select' && row.type === 'heading'}
                    connectGetters={(getter) => {
                        const { selection } = this.props;
                        const rows = getter('rows')();

                        return {
                            rows,
                            allSelected: selection.length === rows.length,
                            someSelected: selection.length !== rows.length && selection.length !== 0,
                        }
                    }}
                    connectActions={(action) => ({
                        toggleAll: (rows) => this.toggleAllSelected(rows),
                    })}>
                    {({ allSelected, someSelected, toggleAll, rows }) =>
                        <SelectAllCell allSelected={allSelected} someSelected={someSelected} toggleAll={toggleAll} rows={rows}/>}
                </Template>
                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => column.type === 'select' && !row.type}>
                    {({ column, row }) => (
                        <SelectCell selected={this.props.selection.indexOf(row.id) > -1} changeSelected={() => this.changeSelected(row.id)} />
                    )}
                </Template>
            </div>
        )
    }
};


// Demo

const rowTemplate = (row) => <div>Detail for {row.name}</div>

export class MagicDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(40),
            sortings: [{ column: 'id', direction: 'asc' }],
            selection: [1, 3, 18],
            expandedRows: [3],
            filters: []
        }

        this.changeExpandedRows = (expandedRows) => this.setState({ expandedRows })
        this.changeSelection = (selection) => this.setState({ selection })
        this.changeSortings = (sortings) => this.setState({ sortings })
        this.changeFilters = (filters) => this.setState({ filters })
    }
    render() {
        let { rows, columns, sortings, selection, expandedRows, filters } = this.state;

        return (
            <div>
                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <TableView/>
                    
                    <HeaderRow/>
                    <HeaderRowSorting/>

                    <FilterRow/>

                    <Selection
                        selection={selection}
                        selectionChange={this.changeSelection}/>
                    <TableRowDetail
                        expanded={expandedRows}
                        expandedChange={this.changeExpandedRows}
                        template={rowTemplate}/>

                        
                    <SortingState
                        sortings={sortings}
                        sortingsChange={this.changeSortings}/>
                    <FilterState
                        filters={filters}
                        filtersChange={this.changeFilters}/>
                </DataGrid>

                {/*<h2>Uncontrolled with default filters</h2>
                <DataGrid
                    rows={rows}
                    columns={columns}>
                    
                    <HeaderRow/>
                    <HeaderRowSorting/>

                    <FilterRow/>
                    <FilterState defaultFilters={[ { column: 'name', value: 'She' } ]}/>

                    <Selection
                        selection={selection}
                        selectionChange={selection => this.setState({ selection })}/>
                    <MasterDetail
                        expanded={expandedRows}
                        expandedChange={expandedRows => this.setState({ expandedRows })}
                        template={(row) => <div>Detail for {row.name}</div>}/>

                        
                    <SortingState
                        sortings={sortings}
                        sortingsChange={sortings => this.setState({ sortings })}/>
                </DataGrid>*/}
            </div>
        )
    }
};