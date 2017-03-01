import React from 'react';

import { VirtualBox, stickyProp } from './components';
import { Columns, Rows, RowProvider, providerFor } from './grid';

export class HeadingRowProvider extends React.Component {
    render() {
        return (
            <RowProvider
                predicate={({ row }) => row.type === 'heading'}
                stick={() => 'before'}
                height={() => 40}
                template={({ rowIndex, row, columns }) => (
                    <Columns
                        columns={columns}
                        rowIndex={rowIndex}
                        row={row}
                        style={{ 
                            background: 'white',
                            borderBottom: '2px solid black'
                        }}/>
                )}/>
        );
    }
};

export class DetailRow extends React.Component {
    render() {
        let rowTemplate = (
            <Columns
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

export class DetailRowProvider extends React.Component {
    render() {
        let { isExpanded, collapsedHeight, expandedHeight } = this.props;
        
        return (
            <RowProvider
                predicate={() => true}
                height={(rowIndex, row) => isExpanded({ rowIndex, row }) ? expandedHeight : collapsedHeight}
                template={({ rowIndex, row, columns }) => (
                    <DetailRow
                        columns={columns}
                        rowIndex={rowIndex}
                        row={row}
                        expanded={isExpanded({ rowIndex, row })}/>
                )}/>
        );
    }
};

export class GroupRow extends React.Component {
    render() {
        let { rowProviders } = this.context.gridHost;

        let itemSize = (index) => {
            if(index === 0) 
                return 40;
            if(this.props.expanded)
                return this.props.row.items.reduce(((accumulator, row, index) =>
                    accumulator + (providerFor({ row }, rowProviders)).height(index, row, rowProviders)
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
                            padding: '10px',
                            borderBottom: '1px solid black',
                            paddingLeft: this.props.row.level * 20 + 10 + 'px',
                            background: '#f8f8f8'
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
                itemInfo={(index) => {
                    return {
                        stick: index === 0 && stickyProp ? 'before' : false,
                        size: itemSize(index)
                    }
                }}
                itemTemplate={itemTemplate}/>
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

export class GroupRowProvider extends React.Component {
    render() {
        let { isExpanded, toggleExpanded } = this.props;
        
        return (
            <RowProvider
                predicate={({ row }) => row.type === 'group'}
                height={(rowIndex, row, rowProviders) => {
                    let result = 40;
                    if(isExpanded({ rowIndex, row })) {
                        result = result + row.items.reduce(((accumulator, row, index) =>
                            accumulator + (providerFor({ row }, rowProviders)).height(index, row, rowProviders)
                        ), 0);
                    }
                    return result;
                }}
                template={({ rowIndex, row, columns }) => (
                    <GroupRow
                        columns={columns}
                        rowIndex={rowIndex}
                        row={row}
                        expanded={isExpanded({ rowIndex, row })}
                        expandedChange={(expanded) => toggleExpanded({ rowIndex, row, expanded })}/>
                )}/>
        );
    }
};