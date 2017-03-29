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
      const prevExpanded = this.props.expanded || this.state.expanded;
      const expanded = setDetailRowExpanded(prevExpanded, { rowId });
      const { expandedChange } = this.props;
      this.setState({ expanded });
      expandedChange && expandedChange(expanded);
    };

    this._tableColumns = tableColumns => [{ type: 'detail', name: 'detail', width: 20 }, ...tableColumns];
  }
  render() {
    const expanded = this.props.expanded || this.state.expanded;
    const { template, detailToggleTemplate } = this.props;

    return (
      <div>
        <Getter
          name="tableColumns"
          pureComputed={this._tableColumns}
          connectArgs={getter => [
            getter('tableColumns')(),
          ]}
        />
        <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && row.type === 'heading'} />
        <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && !row.type}>
          {({ row }) => detailToggleTemplate({
            expanded: isDetailRowExpanded(expanded, row.id),
            toggleExpanded: () => this._setDetailRowExpanded({ rowId: row.id }),
          })}
        </Template>

        <Getter
          name="tableBodyRows"
          pureComputed={expandedDetailRows}
          connectArgs={getter => [
            getter('tableBodyRows')(),
            expanded,
          ]}
        />
        <Template name="tableViewCell" predicate={({ column, row }) => row.type === 'detailRow'}>
          {({ column, row }) => template({ row: row.for })}
        </Template>
      </div>
    );
  }
}
