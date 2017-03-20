import React from 'react';

import { Action, Getter, GetterExtender, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { DataGrid } from '@devexpress/dx-react-datagrid';
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

export class MasterDetail extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            animating: []
        }
        
        this.mTableBodyRows = memoize((rows, expanded, animating) => {
            [...expanded, ...animating].filter((value, index, self) => self.indexOf(value) === index).forEach(rowId => {
                let index = rows.findIndex(row => row.id === rowId);
                if(index !== -1) {
                    let rowIndex = rows.findIndex(row => row.id === rowId);
                    let insertIndex = rowIndex + 1
                    rows = [...rows.slice(0, insertIndex), { type: 'detailRow', for: rows[rowIndex] }, ...rows.slice(insertIndex)]
                }
            })
            return rows
        });
        this.mTableColumns = memoize((columns) => [{ type: 'detail', width: 20 }, ...columns]);
    }
    componentWillReceiveProps(nextProps) {
        let collapsed = this.props.expanded.filter(e => nextProps.expanded.indexOf(e) === -1);
        let expanded = nextProps.expanded.filter(e => this.props.expanded.indexOf(e) === -1);

        let changed = [].concat(collapsed).concat(expanded);

        if(changed.length) {
            this.setState({ animating: this.state.animating.concat(changed) });
            setTimeout(() => {
                this.setState({ 
                    animating: this.state.animating.filter(a => changed.indexOf(a) === -1)
                })
            }, 200);
        }
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableBodyRows" value={(rows) => (this.mTableBodyRows)(rows, this.props.expanded, this.state.animating)}/>
                <GetterExtender name="tableColumns" value={this.mTableColumns}/>
                <GetterExtender name="tableCellInfo" value={(original, getter, { row, columnIndex }) => {
                    let columns = getter('tableColumns')();          
                    if(row.type === 'detailRow') {
                        if(columnIndex !== 0) {
                            return { skip: true };
                        }
                        return { colspan: columns.length };
                    }
                    return original;
                }}/>

                <Template name="tableViewCell" predicate={({ column, row }) => row.type === 'detailRow'}>
                    {({ column, row }) => {
                        let { expanded, expandedChange, template } = this.props;
                        let { animating } = this.state;
                        return (
                            <div>
                                {template ? template(row.for) : <div>Hello detail!</div>}
                                {animating.indexOf(row.for.id) > -1 ? 'Animating' : null}
                            </div>
                        )
                    }}
                </Template>
                <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && row.type === 'heading'} />
                <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && !row.type}>
                    {({ column, row }) => {
                        let { expanded, expandedChange } = this.props;
                        return (
                            <div
                                style={{ width: '100%', height: '100%' }}
                                onClick={() => expandedChange(selectionHelpers.calcSelection(expanded, row.id))}>
                                {expanded.indexOf(row.id) > -1 ? '-' : '+'}
                            </div>
                        );
                    }}
                </Template>
            </div>
        )
    }
};


class StaticTableCell extends React.PureComponent {
    render() {
        let { row, column, colspan, cellContentTemplate } = this.props;
        
        return (
            <td
                style={{ 
                    padding: 0,
                    width: (column.width || 100) + 'px' 
                }}
                colSpan={colspan || 0}>
                {cellContentTemplate({ row, column })}
            </td>
        )
    }
};

class StaticTableRow extends React.PureComponent {
    render() {
        let { row, columns, getCellInfo, cellContentTemplate } = this.props;
        
        return (
            <tr>
                {columns.map((column, columnIndex) => {
                    let info = getCellInfo({ column, row, columnIndex });
                    if(info.skip) return null
                    return (
                        <StaticTableCell key={column.name} row={row} column={column} colspan={info.colspan} cellContentTemplate={cellContentTemplate} />
                    );
                })}
            </tr>
        )
    }
};

class StaticTable extends React.PureComponent {
    render() {
        let { rows, columns, getCellInfo, cellContentTemplate } = this.props;
        
        return (
            <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                    {rows.map((row, rowIndex) => 
                        <StaticTableRow key={row.id} row={row} columns={columns} getCellInfo={getCellInfo} cellContentTemplate={cellContentTemplate} />
                    )}
                </tbody>
            </table>
        );
    }
};

const cellContentTemplate = ({ row, column }) => <TemplatePlaceholder name="tableViewCell" params={{ row, column }} />;

export class GridTableView extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mRows = memoize((headerRows, bodyRows) => [...headerRows, ...bodyRows]);

        this.trololo = (opapa) => this.opapa = opapa;
        this.ololo = (params) => this.opapa(params)
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows" value={[]}/>
                <Getter name="tableBodyRows" value={(getter) => getter('rows')()}/>
                <Getter name="tableColumns" value={(getter) => getter('columns')()}/>
                <Getter name="tableCellInfo" value={{}}/>

                <Template name="root">
                    <TemplatePlaceholder name="tableView" />
                </Template>
                <Template
                    name="tableView"
                    connectGetters={(getter) => ({
                        rows: (this.mRows)(getter('tableHeaderRows')(), getter('tableBodyRows')()),
                        columns: getter('tableColumns')(),
                        getCellInfo: (() => { this.trololo(getter('tableCellInfo')); return this.ololo; })(),
                    })}>
                    <StaticTable cellContentTemplate={cellContentTemplate} />
                </Template>
                <Template name="tableViewCell">
                    {({ row, column }) => (row[column.name] !== undefined ? <span>{row[column.name]}</span> : null)}
                </Template>
            </div>
        )
    }
}


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

                    <GridTableView/>
                    
                    <HeaderRow/>
                    <HeaderRowSorting/>

                    <FilterRow/>

                    <Selection
                        selection={selection}
                        selectionChange={this.changeSelection}/>
                    <MasterDetail
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