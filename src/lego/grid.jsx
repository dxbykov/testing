import React from 'react';
import { WindowedScroller, VirtualBox, VirtualItem } from './components';
import { cellProvider } from './cells';
import { rowProvider } from './rows';

export let cellProviderFor = ({ row, column, cellProviders }) => {
    return cellProviders.filter((p) => p.predicate({ row, column })).pop();
};

export class Cells extends React.Component {
     render() {
        let { columns, row, rowIndex } = this.props;
        let { cellProviders } = this.context.gridHost;

        return (
            <VirtualBox
                direction="horizontal"
                itemCount={columns.length}
                itemSize={(index) => cellProviderFor({ row: row, column: columns[index], cellProviders }).size({ column: columns[index], cellProviders })}
                template={(index) =>
                    cellProviderFor({ row: row, column: columns[index], cellProviders }).template({ 
                        rowIndex: rowIndex,
                        columnIndex: index,
                        row: row,
                        column: columns[index],
                        data: row[columns[index].name]
                    })
                }
                style={this.props.style}/>
        );
    }
}
Cells.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    row: React.PropTypes.any.isRequired,
};
Cells.contextTypes = {
    gridHost: React.PropTypes.shape({
        cellProviders: React.PropTypes.array.isRequired,
    }).isRequired
};


export let rowProviderFor = ({ row, rowProviders }) => {
    return rowProviders.filter((p) => p.predicate({ row })).pop();
};

export class Rows extends React.Component {
    render() {
        let { rows, columns } = this.props;
        let { rowProviders } = this.context.gridHost;

        return (
            <VirtualBox
                direction="vertical"
                itemCount={rows.length}
                itemSize={(index) => 
                    rowProviderFor({ row: rows[index], rowProviders }).size(index, rows[index], rowProviders)
                }
                itemStick={(index) => {
                    let stick = rowProviderFor({ row: rows[index], rowProviders }).stick
                    return stick ? stick(index, rows[index], rowProviders) : false;
                }}
                template={(index) => 
                    rowProviderFor({ row: rows[index], rowProviders }).template({
                        rowIndex: index,
                        row: rows[index],
                        columns: columns,
                    })
                }/>
        )
    }
}
Rows.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rows: React.PropTypes.array.isRequired,
};
Rows.contextTypes = {
    gridHost: React.PropTypes.shape({
        rowProviders: React.PropTypes.array.isRequired,
    }).isRequired
};

export class Grid extends React.Component {
    getChildContext() {
        let { cellProviders, rowProviders } = this.props;

        return {
            gridHost: {
                cellProviders: [cellProvider()].concat(cellProviders || []),
                rowProviders: [rowProvider()].concat(rowProviders || []),
            }
        };
    }

    render() {
        let { rows, columns } = this.props

        return (
            <div style={{ height: '340px', border: '1px solid black' }}>
                <WindowedScroller>
                    <Rows
                        rows={rows}
                        columns={columns}/>
                </WindowedScroller>
            </div>
        );
    }
}
Grid.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rows: React.PropTypes.array.isRequired,
    cellProviders: React.PropTypes.array,
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.shape({
        cellProviders: React.PropTypes.array.isRequired,
        rowProviders: React.PropTypes.array.isRequired,
    }).isRequired
};
