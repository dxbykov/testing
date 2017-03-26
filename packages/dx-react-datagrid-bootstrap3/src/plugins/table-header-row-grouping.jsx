import React from 'react';
import { TableHeaderRowGrouping as TableHeaderRowGroupingBase } from '@devexpress/dx-react-datagrid';
import { GroupableCell } from '../templates/groupable-cell.jsx';

export const TableHeaderRowGrouping = () => (
    <TableHeaderRowGroupingBase
        groupableCellTemplate={GroupableCell} />
);