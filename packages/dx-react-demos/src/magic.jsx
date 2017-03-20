import React from 'react';

import { Action, Getter, GetterExtender, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { DataGrid, SortingState, TableView, TableRowDetail, TableHeaderRowSorting, FilterState, TableFilterRow } from '@devexpress/dx-react-datagrid';
import './magic.css';

import { generateColumns, generateRows } from './demoData';
import { defaultMemoize } from 'reselect'

const memoize = defaultMemoize;


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
                    <TableHeaderRowSorting/>

                    <TableFilterRow/>

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