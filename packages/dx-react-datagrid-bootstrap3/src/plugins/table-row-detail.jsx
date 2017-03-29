import React from 'react';
import { TableRowDetail as TableRowDetailBase } from '@devexpress/dx-react-datagrid';
import { TableDetailToggle } from '../templates/table-detail-toggle';

export const TableRowDetail = ({ expanded, defaultExpanded, expandedChange, template }) => (
  <TableRowDetailBase
    detailToggleTemplate={TableDetailToggle}
    expanded={expanded}
    defaultExpanded={defaultExpanded}
    expandedChange={expandedChange}
    template={template}
  />
);

TableRowDetail.propTypes = {
  expanded: React.PropTypes.array,
  defaultExpanded: React.PropTypes.array,
  expandedChange: React.PropTypes.func,
  template: React.PropTypes.func.isRequired,
};

TableRowDetail.defaultProps = {
  expanded: undefined,
  defaultExpanded: undefined,
  expandedChange: undefined,
};
