import React from 'react';
import { WindowedScroller, VirtualBox, VirtualItem } from './components';

export class Cell extends React.Component {
    render() {
        let { children, style, ...other } = this.props;

        return (
            <div
                style={{ 
                    padding: '10px',
                    borderBottom: '1px dotted black',
                    borderRight: '1px dotted black',
                    ...style
                }}
                {...other}>
                {children}
            </div>
        );
    }
}

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
                itemInfo={(index) => {
                    let column = columns[index];
                    let cellProvider = cellProviderFor({ row, column, cellProviders });
                    
                    return {
                        preserve: cellProvider.preserve ? cellProvider.preserve({ column: column, cellProviders }) : false,
                        size: cellProvider.size({ column: column, cellProviders }),
                        stick: cellProvider.stick ? cellProvider.stick(index, row, cellProviders) : false,
                        key: column.name
                    }
                }}
                itemTemplate={(index) => {
                    let column = columns[index];
                    let cellProvider = cellProviderFor({ row, column, cellProviders });

                    return cellProvider
                        .template({ 
                            rowIndex: rowIndex,
                            columnIndex: index,
                            row: row,
                            column: column,
                            data: row[column.name]
                        })
                }}
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
                itemInfo={(index) => {
                    let row = rows[index];
                    let rowProvider = rowProviderFor({ row, rowProviders });
                    
                    return {
                        size: rowProvider.size(index, rows[index], rowProviders),
                        stick: rowProvider.stick ? rowProvider.stick(index, rows[index], rowProviders) : false,
                    }
                }}
                itemTemplate={(index) => {
                    let row = rows[index];
                    let rowProvider = rowProviderFor({ row, rowProviders });
                    
                    return rowProvider
                        .template({
                            rowIndex: index,
                            row: rows[index],
                            columns: columns,
                        })
                }}/>
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
        let { rows, columns, cellProviders, rowProviders } = this.props;

        return {
            gridHost: {
                cellProviders: [],
                rowProviders: [],
                rows,
                columns,
                projectPoint: ({ x, y }) => {
                    let rect = this.root.getBoundingClientRect();
                    return { x: x - rect.left, y: y - rect.top };
                },
                columnAt: ({ x }) => {
                    let index = 0;
                    let offset = 0;
                    while(index < columns.length) {
                        let column = columns[index];
                        let cellProvider = cellProviderFor({ row: rows[0], column, cellProviders });
                        let itemSize = cellProvider.size({ column, cellProviders });
                        
                        if(x >= offset && x < offset + itemSize) {
                            return column;
                        }

                        index = index + 1;
                        offset = offset + itemSize;
                    }
                }
            }
        };
    }

    render() {
        let { rows, columns, children } = this.props;

        return (
            <div style={{ height: '340px', border: '1px solid black' }}>
                <RowProvider/>
                <CellProvider/>
                { children }
                <WindowedScroller>
                    <div ref={ref => this.root = ref}>
                        <Rows
                            rows={rows}
                            columns={columns}/>
                    </div>
                </WindowedScroller>
            </div>
        );
    }
}
Grid.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rows: React.PropTypes.array.isRequired,
    cellProviders: React.PropTypes.array,
    rowProviders: React.PropTypes.array,
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.object.isRequired
};

export class RowProvider extends React.Component {
    render() {
        let { stick, predicate, size, template } = this.props;

        this.context.gridHost.rowProviders.push({
            predicate: predicate || (() => true),
            size: size || (() => 40),
            stick: stick || (() => false),
            template: template || (({ rowIndex, row, columns }) => (
                <Cells
                    columns={columns}
                    rowIndex={rowIndex}
                    row={row}/>
            )),
        });

        return null;
    }
};
RowProvider.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
};

export class CellProvider extends React.Component {
    render() {
        let { stick, predicate, size, template, preserve } = this.props;

        this.context.gridHost.cellProviders.push({
            predicate: predicate || (() => true),
            stick: stick || (() => false),
            size: size || (({ column }) => column.width || 200),
            preserve: preserve || (() => false),
            template: template || (({ data }) => (
                <Cell>{data}</Cell>
            ))
        });

        return null;
    }
};
CellProvider.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
};
