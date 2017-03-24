import React from 'react';
import { TableRowDetail as TableRowDetailBase } from '@devexpress/dx-react-datagrid';
import { TableDetailToggle } from '../templates/table-detail-toggle.jsx';

export const TableRowDetail = ({ expanded, defaultExpanded, expandedChange, template }) => (
    <TableRowDetailBase
        detailToggleTemplate={({ expanded, toggleExpanded }) => <TableDetailToggle expanded={expanded} toggleExpanded={toggleExpanded} />}
        expanded={expanded}
        defaultExpanded={defaultExpanded}
        expandedChange={expandedChange}
        template={template} />
);