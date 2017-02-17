import React from 'react';

import { VirtualBox, stickySupported } from './components';
import { Cells, Rows, rowProviderFor } from './grid';


export const rowProvider = () => {
    return {
        predicate: () => true,
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
        predicate: ({ row }) => row.type === 'heading',
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
        predicate: () => true,
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

        let itemSize = (index) => {
            if(index === 0) 
                return 40;
            if(this.props.expanded)
                return this.props.row.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row, rowProviders })).size(index, row, rowProviders)
                ), 0)
            return 0;
        };
        let itemTemplate = (index) => {
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
        rowProviders: React.PropTypes.array.isRequired,
    }).isRequired
};

export const groupRowProvider = ({ isExpanded, toggleExpanded }) => {
    return {
        predicate: ({ row }) => row.type === 'group',
        size: (rowIndex, row, rowProviders) => {
            let result = 40;
            if(isExpanded({ rowIndex, row })) {
                result = result + row.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row, rowProviders })).size(index, row, rowProviders)
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