import React from 'react';
import { WindowedScroller, VirtualBox, VirtualItem } from './components';

export let providerFor = (data, providers) => {
    return providers.filter((p) => p.predicate(data)).pop();
};

export class Cell extends React.Component {
    render() {
        let { children, style, ...other } = this.props;

        return (
            <div
                style={{ 
                    padding: '10px',
                    borderBottom: '1px dotted black',
                    borderRight: '1px dotted black',
                    minHeight: '39px',
                    ...style
                }}
                {...other}>
                {children}
            </div>
        );
    }
}

export class Columns extends React.Component {
     render() {
        let { columns, row, rowIndex } = this.props;
        let { columnProviders, cellProviders } = this.context.gridHost;

        return (
            <VirtualBox
                direction="horizontal"
                itemCount={columns.length}
                itemInfo={(index) => {
                    let column = columns[index];
                    let cellProvider = providerFor({ row, column }, cellProviders);
                    let columnProvider = providerFor({ column }, columnProviders);

                    if(cellProvider) {
                        return {
                            preserve: cellProvider.preserve ? cellProvider.preserve({ column: column, cellProviders }) : false,
                            size: columnProvider.width({ column: column }),
                            stick: cellProvider.stick ? cellProvider.stick(index, row, cellProviders) : false,
                            key: column.name
                        }
                    }
                    
                    return {
                        size: columnProvider.width({ column: column }),
                        stick: columnProvider.stick ? columnProvider.stick(index, row) : false,
                        key: column.name
                    }
                }}
                itemTemplate={(index) => {
                    let column = columns[index];
                    let columnProvider = providerFor({ column }, columnProviders);
                    let cellProvider = providerFor({ row, column }, cellProviders);

                    if(cellProvider) {
                        return cellProvider
                            .template({ 
                                rowIndex: rowIndex,
                                columnIndex: index,
                                row: row,
                                column: column,
                                data: row[column.name]
                            }) 
                    }

                    return columnProvider
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
Columns.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    row: React.PropTypes.any.isRequired,
};
Columns.contextTypes = {
    gridHost: React.PropTypes.shape({
        cellProviders: React.PropTypes.array.isRequired,
        columnProviders: React.PropTypes.array.isRequired,
    }).isRequired
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
                    let rowProvider = providerFor({ row }, rowProviders);
                    
                    return {
                        size: rowProvider.height(index, rows[index], rowProviders),
                        stick: rowProvider.stick ? rowProvider.stick(index, rows[index], rowProviders) : false,
                    }
                }}
                itemTemplate={(index) => {
                    let row = rows[index];
                    let rowProvider = providerFor({ row }, rowProviders);
                    
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
        let { rows, columns } = this.props;
        
        let cellProviders = [];
        let rowProviders = [];
        let columnProviders = [];

        this.host = {
            cellProviders,
            rowProviders,
            columnProviders,
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
                    let columnProvider = providerFor({ column }, columnProviders);
                    let itemSize = columnProvider.width({ column, columnProviders });
                    
                    if(x >= offset && x < offset + itemSize) {
                        return column;
                    }

                    index = index + 1;
                    offset = offset + itemSize;
                }
            }
        };

        return {
            gridHost: this.host 
        };
    }

    render() {
        let { rows, columns, children } = this.props;

        return (
            <div style={{ height: '340px', border: '1px solid black' }}>
                <RowProvider/>
                <ColumnProvider/>
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
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.object.isRequired
};

export class RowProvider extends React.Component {
    render() {
        let { stick, predicate, height, template } = this.props;
        let { rowProviders } = this.context.gridHost;

        rowProviders.push({
            predicate: predicate || (() => true),
            height: height || (() => 40),
            stick: stick || (() => false),
            template: template || (({ rowIndex, row, columns }) => (
                <Columns
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

export class ColumnProvider extends React.Component {
    render() {
        let { stick, predicate, width, template, preserve } = this.props;
        let { columnProviders, cellProviders } = this.context.gridHost;

        columnProviders.push({
            predicate: predicate || (() => true),
            stick: stick || (() => false),
            width: width || (({ column }) => column.width || 200),
            template: template || (({ data }) => (
                <Cell>{data}</Cell>
            ))
        });

        return null;
    }
};
ColumnProvider.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
};

export class CellProvider extends React.Component {
    render() {
        let { stick, predicate, width, template, preserve } = this.props;
        let { cellProviders } = this.context.gridHost;

        cellProviders.push({
            predicate: predicate || (() => true),
            stick: stick || (() => false),
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
