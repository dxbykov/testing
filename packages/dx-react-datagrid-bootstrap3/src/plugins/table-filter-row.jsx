import React from 'react';
import { TableFilterRow as TableFilterRowBase } from '@devexpress/dx-react-datagrid';
import { FilterCell } from '../templates/filter-cell.jsx';

export const TableFilterRow = () => (
    <TableFilterRowBase filterCellTemplate={FilterCell} />
);