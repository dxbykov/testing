import React from 'react';

import { Cell, DetailCell } from './cells'
import { VirtualBox } from './components'

export class Row extends React.Component {
     render() {
        let cellTemplate = this.props.cellTemplate || (({ rowIndex, columnIndex, data }) => (
            <Cell
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                data={data}/>
        ));

        return (
            <VirtualBox
                direction="horizontal"
                dataSize={this.props.columns.length}
                getItemSize={(index) => this.props.columns[index].width || 200}
                template={
                    ({ index }) => cellTemplate({ 
                        rowIndex: this.props.rowIndex,
                        columnIndex: index,
                        data: this.props.rowData[this.props.columns[index].name]
                    })
                }/>
        );
    }
}
Row.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired,
    cellTemplate: React.PropTypes.func,
};

export const rowProvider = {
    getSize: () => 40,
    template: ({ rowIndex, rowData, columns, cellTemplate }) => (
        <Row
            columns={columns}
            rowIndex={rowIndex}
            rowData={rowData}
            cellTemplate={cellTemplate}/>
    )
};

export class DetailRow extends React.Component {
    render() {
        let cellTemplate = this.props.cellTemplate || (({ rowIndex, columnIndex, data }) => {
            if(this.props.columns[columnIndex].type === 'detail') {
                return (
                    <DetailCell
                        rowIndex={rowIndex}
                        columnIndex={columnIndex}
                        expanded={this.props.expanded}
                        expandedChange={(expanded) => {
                            this.props.expandedChange(expanded);
                        }}/>
                );
            }
            return (
                <Cell
                    rowIndex={rowIndex}
                    columnIndex={columnIndex}
                    data={data}/>
            );
        });

        let rowTemplate = (
            <Row
                columns={this.props.columns}
                rowIndex={this.props.rowIndex}
                rowData={this.props.rowData}
                cellTemplate={cellTemplate}/>
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
    cellTemplate: React.PropTypes.func,
    expanded: React.PropTypes.bool.isRequired,
    expandedChange: React.PropTypes.func.isRequired,
};

export const detailProvider = (options) => {
    let { isExpanded, toggleExpanded, collapsedHeight, expandedHeight } = options;

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
        let getItemSize = (index) => {
            if(index === 0) 
                return 40;
            return this.props.rowProvider.getSize(index - 1, this.props.rowData.items[index - 1]);
        };
        let itemTemplate = ({ index, position }) => {
            if(index === 0) {
                return (
                    <div onClick={() => this.props.expandedChange(!this.props.expanded)} style={{ width: '100%', height: '100%', border: '1px dashed black' }}>
                        {`[${this.props.expanded ? '-' : '+'}] Group: ${this.props.rowData.value}`}
                    </div>
                );
            }

            return this.props.rowProvider.template({
                rowIndex: index - 1,
                rowData: this.props.rowData.items[index - 1],
                columns: this.props.columns,
            });
        };

        return (
            <VirtualBox
                direction="vertical"
                dataSize={(this.props.expanded ? this.props.rowData.items.length : 0) + 1}
                getItemSize={getItemSize}
                template={itemTemplate}/>
        );
    }
}
GroupRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired,
    rowProvider: React.PropTypes.shape({
        getSize: React.PropTypes.func.isRequired,
        template: React.PropTypes.func.isRequired,
    }).isRequired,
};

export const groupProvider = (options) => {
    let { isExpanded, toggleExpanded } = options;
    let _rowProvider = options.rowProvider || rowProvider;

    return {
        getSize: (index, row) => 40 + (isExpanded(index) ? row.items.reduce((accumulator, row, index) => accumulator + _rowProvider.getSize(index, row), 0) : 0),
        template: ({ rowIndex, rowData, columns, cellTemplate }) => (
            <GroupRow
                columns={columns}
                rowIndex={rowIndex}
                rowData={rowData}
                rowProvider={_rowProvider}
                expanded={isExpanded(rowIndex)}
                expandedChange={(expanded) => toggleExpanded(rowIndex, expanded)}/>
        )
    };
};