import React from 'react';

import { VirtualBox, stickySupported } from './components'

export class Cells extends React.Component {
     render() {
        let { columns, row, rowIndex } = this.props;
        
        let cellProviderFor = ({ column }) =>
            column.type ? this.context.gridHost.cellProviders[column.type] : this.context.gridHost.cellProviders['*'];

        return (
            <VirtualBox
                direction="horizontal"
                itemCount={columns.length}
                itemSize={(index) => cellProviderFor({ column: columns[index] }).size({ column: columns[index] })}
                template={
                    ({ index }) => cellProviderFor({ column: columns[index] }).template({ 
                        rowIndex: rowIndex,
                        columnIndex: index,
                        row: row,
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
        cellProviders: React.PropTypes.object.isRequired,
    }).isRequired
};

export class Rows extends React.Component {
    render() {
        let { rows, columns } = this.props;
        let { rowProviders } = this.context.gridHost;

        let rowProviderFor = ({ row }) =>
            row.type ? rowProviders[row.type] : rowProviders['*'];

        return (
            <VirtualBox
                direction="vertical"
                itemCount={rows.length}
                itemSize={(index) => rowProviderFor({ row: rows[index] }).size(index, rows[index], rowProviders)}
                itemStick={(index) => {
                    let stick = rowProviderFor({ row: rows[index] }).stick
                    return stick ? stick(index, rows[index], rowProviders) : false;
                }}
                template={
                    ({ index, position }) => rowProviderFor({ row: rows[index] }).template({
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
        rowProviders: React.PropTypes.object.isRequired,
    }).isRequired
};

export const rowProvider = () => {
    return {
        size: () => 40,
        template: ({ rowIndex, row, columns }) => (
            <Cells
                columns={columns}
                rowIndex={rowIndex}
                row={row}/>
        )
    };
};



export const headingRowProvider = () => {
    return {
        stick: () => 'before',
        size: () => 40,
        template: ({ rowIndex, row, columns }) => (
            <Cells
                columns={columns}
                rowIndex={rowIndex}
                row={row}
                style={{ 
                    background: 'white',
                    borderBottom: '2px solid black'
                }}/>
        )
    };
};

export class DetailRow extends React.Component {
    render() {
        let rowTemplate = (
            <Cells
                columns={this.props.columns}
                rowIndex={this.props.rowIndex}
                row={this.props.row}/>
        );
        let detailTemplate = this.props.expanded && (
            <div style={{ width: '100%', height: 40, borderBottom: '1px dashed black' }}>
                This is detail view
            </div>
        );

        return (
            <div>
                <div style={{ height: 40 + 'px' }}>
                    {rowTemplate}
                </div>
                {detailTemplate}
            </div>
        );
    }
}
DetailRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    row: React.PropTypes.any.isRequired,
    expanded: React.PropTypes.bool.isRequired,
};

export const detailRowProvider = ({ isExpanded, toggleExpanded, collapsedHeight, expandedHeight }) => {
    return {
        size: (rowIndex, row) => isExpanded({ rowIndex, row }) ? expandedHeight : collapsedHeight,
        template: ({ rowIndex, row, columns }) => {
            return (
                <DetailRow
                    columns={columns}
                    rowIndex={rowIndex}
                    row={row}
                    expanded={isExpanded({ rowIndex, row })}/>
            );
        }
    }
}

export class GroupRow extends React.Component {
    render() {
        let { rowProviders } = this.context.gridHost;

        let rowProviderFor = ({ row }) =>
            row.type ? rowProviders[row.type] : rowProviders['*'];

        let itemSize = (index) => {
            if(index === 0) 
                return 40;
            if(this.props.expanded)
                return this.props.row.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row })).size(index, row, rowProviders)
                ), 0)
            return 0;
        };
        let itemTemplate = ({ index, position }) => {
            if(index === 0) {
                return (
                    <div onClick={() => this.props.expandedChange(!this.props.expanded)}
                        style={{ 
                            width: '100%',
                            height: '100%',
                            borderBottom: '1px solid black',
                            paddingLeft: this.props.row.level * 20 + 'px',
                            background: 'white'
                        }}>
                        {`[${this.props.expanded ? '-' : '+'}] Group: ${this.props.row.value}`}
                    </div>
                );
            }

            return (
                <Rows
                    columns={this.props.columns}
                    rows={this.props.row.items}/>
            );
        };

        return (
            <VirtualBox
                direction="vertical"
                itemCount={2}
                itemStick={(index) => index === 0 && stickySupported ? 'before' : false}
                itemSize={itemSize}
                template={itemTemplate}/>
        );
    }
}
GroupRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    row: React.PropTypes.any.isRequired
};
GroupRow.contextTypes = {
    gridHost: React.PropTypes.shape({
        rowProviders: React.PropTypes.object.isRequired,
    }).isRequired
};

export const groupRowProvider = ({ isExpanded, toggleExpanded }) => {
    return {
        size: (rowIndex, row, rowProviders) => {
            let rowProviderFor = ({ row }) =>
                row.type ? rowProviders[row.type] : rowProviders['*'];

            let result = 40;
            if(isExpanded({ rowIndex, row })) {
                result = result + row.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row })).size(index, row, rowProviders)
                ), 0);
            }
            return result;
        },
        template: ({ rowIndex, row, columns }) => (
            <GroupRow
                columns={columns}
                rowIndex={rowIndex}
                row={row}
                expanded={isExpanded({ rowIndex, row })}
                expandedChange={(expanded) => toggleExpanded({ rowIndex, row, expanded })}/>
        )
    };
};