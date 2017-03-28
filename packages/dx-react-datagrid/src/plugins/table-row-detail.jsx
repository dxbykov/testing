import React from 'react';
import { Getter, Template } from '@devexpress/dx-react-core';
import { setDetailRowExpanded, expandedDetailRows, isDetailRowExpanded } from '@devexpress/dx-datagrid-core';

export class TableRowDetail extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            expanded: props.defaultExpanded || [],
        };

        this._setDetailRowExpanded = ({ rowId }) => {
            let prevExpanded = this.props.expanded || this.state.expanded;
            let expanded = setDetailRowExpanded(prevExpanded, { rowId });
            let { expandedChange } = this.props;
            this.setState({ expanded });
            expandedChange && expandedChange(expanded);
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
                        expanded: isDetailRowExpanded(expanded, row.id),
                        toggleExpanded: () => this._setDetailRowExpanded({ rowId: row.id })
                    })}
                </Template>

                <Getter name="tableBodyRows"
                    pureComputed={({ rows, expandedRows }) => expandedDetailRows(rows, expandedRows)}
                    connectArgs={(getter) => ({
                        rows: getter('tableBodyRows')(),
                        expandedRows: expanded
                    })}/>
                <Template name="tableViewCell" predicate={({ column, row }) => row.type === 'detailRow'}>
                    {({ column, row }) => template({ row: row.for })}
                </Template>
            </div>
        )
    }
};