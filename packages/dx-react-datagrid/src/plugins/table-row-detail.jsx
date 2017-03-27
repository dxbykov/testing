import React from 'react';
import { Getter, Template } from '@devexpress/dx-react-core';

const expandingHelpers = {
    calcExpanded: (prevExpanded, rowId) => {
        let expandedRows = prevExpanded.slice(),
            expandedIndex = expandedRows.indexOf(rowId);
        
        if(expandedIndex > -1) {
            expandedRows.splice(expandedIndex, 1);
        } else if (expandedIndex === -1) {
            expandedRows.push(rowId)
        }

        return expandedRows;
    },
}

export class TableRowDetail extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: props.defaultExpanded || [],
        };

        this.changeExpanded = (expanded) => {
            let prevExpanded = this.props.expanded || this.state.expanded;
            let { expandedChange } = this.props;
            this.setState({ expanded });
            expandedChange && expandedChange(expanded);
        };
        
        this._tableBodyRows = ({ tableBodyRows, expanded }) => {
            expanded.filter((value, index, self) => self.indexOf(value) === index).forEach(rowId => {
                let index = tableBodyRows.findIndex(row => row.id === rowId);
                if(index !== -1) {
                    let rowIndex = tableBodyRows.findIndex(row => row.id === rowId);
                    let insertIndex = rowIndex + 1
                    let row = tableBodyRows[rowIndex];
                    tableBodyRows = [
                        ...tableBodyRows.slice(0, insertIndex),
                        { type: 'detailRow', id: 'detailRow' + row.id, for: row, colspan: 0, height: 'auto' },
                        ...tableBodyRows.slice(insertIndex)
                    ];
                }
            });
            return tableBodyRows;
        };
        this._tableColumns = ({ tableColumns }) => [{ type: 'detail', name: 'detail', width: 20 }, ...tableColumns];
    }
    render() {
        let expanded = this.props.expanded || this.state.expanded;
        let { template, detailToggleTemplate } = this.props;

        return (
            <div>
                <Getter name="tableColumns"
                    pureComputed={this._tableColumns}
                    connectArgs={(getter) => ({
                        tableColumns: getter('tableColumns')(),
                    })}/>
                <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && row.type === 'heading'} />
                <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && !row.type}>
                    {({ row }) => detailToggleTemplate({
                        expanded: expanded.indexOf(row.id) > -1,
                        toggleExpanded: () => this.changeExpanded(expandingHelpers.calcExpanded(expanded, row.id))
                    })}
                </Template>

                <Getter name="tableBodyRows"
                    pureComputed={this._tableBodyRows}
                    connectArgs={(getter) => ({
                        tableBodyRows: getter('tableBodyRows')(),
                        expanded: expanded
                    })}/>
                <Template name="tableViewCell" predicate={({ column, row }) => row.type === 'detailRow'}>
                    {({ column, row }) => template({ row: row.for })}
                </Template>
            </div>
        )
    }
};