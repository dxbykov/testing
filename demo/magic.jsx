import React from 'react';

import './magic.css';

import { generateColumns, generateRows } from './demoData';

export class HeaderRow extends React.Component {
    componentWillMount() {
        let { gridHost } = this.context;
        let orig_postprocessRows = gridHost.postprocessRows;
        gridHost.postprocessRows = (rows, columns) => {
            return [columns.reduce((accum, c) => {
                accum[c.name] = c.title;
                return accum;
            }, { type: 'heading' })].concat(orig_postprocessRows(rows, columns));
        };
    }
    render() {
        return null
    }
};
HeaderRow.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

const calcSortings = (columnName, prevSorting) => {
    let sorting = prevSorting.filter(s => { return s.column == columnName; })[0];
    return [
        {
            column: columnName,
            direction: (sorting && sorting.direction == 'asc') ? 'desc' : 'asc'
        }
    ];
};
const directionFor = (columnName, sortings) => {
    let sorting = sortings.filter(s => s.column === columnName)[0];
    return sorting ? sorting.direction : false;
};
const sort = (rows, sortings) => {
    if(!sortings.length)
        return rows;

    let sortColumn = sortings[0].column,
        result = rows.slice().sort((a, b) => {
            let value = (a[sortColumn] < b[sortColumn]) ^ sortings[0].direction === "desc"
            return value ? -1 : 1;
        });
    return result;
};
export class HeaderRowSorting extends React.Component {
    componentWillMount() {
        let { gridHost } = this.context;
        let orig_preprocessRows = gridHost.preprocessRows;
        gridHost.preprocessRows = (rows, columns) => {
            let { sortings } = this.props;
            return sort(orig_preprocessRows(rows, columns), sortings);
        };
        let origRenderCell = gridHost.renderCell;
        gridHost.renderCell = (row, column) => {
            if(row.type === 'heading') {
                let { sortings, sortingsChange } = this.props;
                let direction = directionFor(column.name, sortings);
                return (
                    <div onClick={() => sortingsChange(calcSortings(column.name, sortings))} style={{ width: '100%', height: '100%' }}>
                        {origRenderCell(row, column)} [{ direction ? (direction === 'desc' ? '↑' : '↓') : '#'}]
                    </div>
                );
            }
            return origRenderCell(row, column);
        };
    }
    render() {
        return null
    }
};
HeaderRowSorting.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

const calcSelection = (prevSelection, rowId) => {
    let selectedRows = prevSelection.slice(),
        selectedIndex = selectedRows.indexOf(rowId);
    
    if(selectedIndex > -1) {
        selectedRows.splice(selectedIndex, 1);
    } else if (selectedIndex === -1) {
        selectedRows.push(rowId)
    }

    return selectedRows;
};
const toggleSelectAll = (prevSelection, rows, getRowId) => {
    if(prevSelection.length === rows.length) {
        return [];
    } else {
        return rows.map(getRowId);
    }
};
export class Selection extends React.Component {
    componentWillMount() {
        let { gridHost } = this.context;
        let orig_postprocessColumns = gridHost.postprocessColumns;
        gridHost.postprocessColumns = (columns) => {
            return [{ type: 'select', width: 20 }].concat(orig_postprocessColumns(columns));
        };
        let origRenderCell = gridHost.renderCell;
        gridHost.renderCell = (row, column) => {
            let { selection, selectionChange } = this.props;
            if(column.type === 'select' && row.type === 'heading') {
                return (
                    <input
                        type='checkbox'
                        checked={selection.length === gridHost.rows().length}
                        ref={(ref) => { ref && (ref.indeterminate = selection.length !== gridHost.rows().length && selection.length !== 0)}}
                        onClick={() => selectionChange(toggleSelectAll(selection, gridHost.rows(), (row) => row.id))}
                        style={{ margin: '0' }}/>
                );
            }
            if(column.type === 'select') {
                return (
                    <input
                        type='checkbox'
                        checked={selection.indexOf(row.id) > -1}
                        onClick={() => selectionChange(calcSelection(selection, row.id))}
                        style={{ margin: '0' }}/>
                );
            }
            return origRenderCell(row, column);
        };
    }
    render() {
        return null
    }
};
Selection.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export class Grid extends React.Component {
    constructor(props) {
        super(props);

        this.host = {
            preprocessRows: (rows) => rows,
            postprocessRows: (rows) => rows,
            preprocessColumns: (columns) => columns,
            postprocessColumns: (columns) => columns,
            renderCell: (row, column) => row[column.name],
            rows: () => this.props.rows,
            columns: () => this.props.columns,
        };
    }
    getChildContext() {
        return {
            gridHost: this.host
        }
    }
    render() {
        let { rows, columns, children } = this.props;

        return (
            <div>
                {children}
                <GridRenderer 
                    rows={rows}
                    columns={columns}/>
            </div>
        )
    }
};
Grid.propTypes = {
    rows: React.PropTypes.array.isRequired,
    columns: React.PropTypes.array.isRequired,
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class GridRenderer extends React.Component {
    render() {
        let { rows, columns, children } = this.props;
        let { gridHost } = this.context;

        rows = gridHost.preprocessRows(rows, columns);
        rows = gridHost.postprocessRows(rows, columns);
        columns = gridHost.preprocessColumns(columns, rows);
        columns = gridHost.postprocessColumns(columns, rows);

        return (
            <table style={{ borderCollapse: 'collapse' }}>
                {children}
                {rows.map(row => 
                    <tr key={row.id}>
                        {columns.map(column =>
                            <td key={column.name} style={{ width: (column.width || 100) + 'px' }}>{gridHost.renderCell(row, column)}</td>
                        )}
                    </tr>
                )}
            </table>
        )
    }
}
GridRenderer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export class MagicDemo extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(20),
            sortings: [{ column: 'id', direction: 'asc' }],
            selection: [1, 3, 18]
        }
    }

    render() {
        let { rows, columns, sortings, selection } = this.state;

        return (
            <div>
                <Grid
                    rows={rows}
                    columns={columns}>
                    <HeaderRow/>
                    <HeaderRowSorting
                        sortings={sortings}
                        sortingsChange={sortings => this.setState({ sortings })}/>
                    <Selection
                        selection={selection}
                        selectionChange={selection => this.setState({ selection })}/>
                </Grid>
            </div>
        )
    }
};