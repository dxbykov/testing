import React from 'react';

import { VirtualBox } from './components'

export class Cells extends React.Component {
     render() {
        let { columns, rowData, rowIndex } = this.props;
        
        let cellProviderFor = ({ column }) =>
            column.type ? this.context.gridHost.cellProviders[column.type] : this.context.gridHost.cellProviders['*'];

        return (
            <VirtualBox
                direction="horizontal"
                dataSize={columns.length}
                getItemSize={(index) => cellProviderFor({ column: columns[index] }).getSize({ column: columns[index] })}
                template={
                    ({ index }) => cellProviderFor({ column: columns[index] }).template({ 
                        rowIndex: rowIndex,
                        columnIndex: index,
                        row: rowData,
                        data: rowData[columns[index].name]
                    })
                }/>
        );
    }
}
Cells.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired,
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
                dataSize={rows.length}
                getItemSize={(index) => rowProviderFor({ row: rows[index] }).getSize(index, rows[index], rowProviders)}
                template={
                    ({ index, position }) => rowProviderFor({ row: rows[index] }).template({
                        rowIndex: index,
                        rowData: rows[index],
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
        getSize: () => 40,
        template: ({ rowIndex, rowData, columns }) => (
            <Cells
                columns={columns}
                rowIndex={rowIndex}
                rowData={rowData}/>
        )
    };
};

export class DetailRow extends React.Component {
    render() {
        let rowTemplate = (
            <Cells
                columns={this.props.columns}
                rowIndex={this.props.rowIndex}
                rowData={this.props.rowData}/>
        );
        let detailTemplate = this.props.expanded && (
            <div style={{ width: '100%', height: 40 }}>
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
    rowData: React.PropTypes.any.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    expandedChange: React.PropTypes.func.isRequired,
};

export const detailProvider = ({ isExpanded, toggleExpanded, collapsedHeight, expandedHeight }) => {
    return {
        getSize: (index, row) => isExpanded(index, row) ? expandedHeight : collapsedHeight,
        template: ({ rowIndex, rowData, columns }) => {
            return (
                <DetailRow
                    columns={columns}
                    rowIndex={rowIndex}
                    rowData={rowData}
                    expanded={isExpanded(rowIndex, rowData)}
                    expandedChange={(expanded) => toggleExpanded(rowIndex, rowData, expanded)}/>
            );
        }
    }
}

export class GroupRow extends React.Component {
    render() {
        let { rowProviders } = this.context.gridHost;

        let rowProviderFor = ({ row }) =>
            row.type ? rowProviders[row.type] : rowProviders['*'];

        let getItemSize = (index) => {
            if(index === 0) 
                return 40;
            if(this.props.expanded)
                return this.props.rowData.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row })).getSize(index, row)
                ), 0)
            return 0;
        };
        let itemTemplate = ({ index, position }) => {
            if(index === 0) {
                return (
                    <div onClick={() => this.props.expandedChange(!this.props.expanded)} style={{ width: '100%', height: '100%', border: '1px dashed black' }}>
                        {`[${this.props.expanded ? '-' : '+'}] Group: ${this.props.rowData.value}`}
                    </div>
                );
            }

            return (
                <Rows
                    columns={this.props.columns}
                    rows={this.props.rowData.items}/>
            );
        };

        return (
            <VirtualBox
                direction="vertical"
                dataSize={2}
                getItemSize={getItemSize}
                template={itemTemplate}/>
        );
    }
}
GroupRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired
};
GroupRow.contextTypes = {
    gridHost: React.PropTypes.shape({
        rowProviders: React.PropTypes.object.isRequired,
    }).isRequired
};

export const groupProvider = ({ isExpanded, toggleExpanded }) => {
    return {
        getSize: (index, row, rowProviders) => {
            let rowProviderFor = ({ row }) =>
                row.type ? rowProviders[row.type] : rowProviders['*'];

            let result = 40;
            if(isExpanded(index)) {
                result = result + row.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row })).getSize(index, row)
                ), 0);
            }
            return result;
        },
        template: ({ rowIndex, rowData, columns }) => (
            <GroupRow
                columns={columns}
                rowIndex={rowIndex}
                rowData={rowData}
                expanded={isExpanded(rowIndex)}
                expandedChange={(expanded) => toggleExpanded(rowIndex, expanded)}/>
        )
    };
};