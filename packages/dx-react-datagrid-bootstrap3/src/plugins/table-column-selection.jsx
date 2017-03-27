import React from 'react';
import { TableColumnSelection as TableColumnSelectionBase } from '@devexpress/dx-react-datagrid';
import { SelectAllCell } from '../templates/select-all-cell.jsx';
import { SelectCell } from '../templates/select-cell.jsx';

export const TableColumnSelection = () => (
    <TableColumnSelectionBase
        selectCellTemplate={SelectCell}
        selectAllCellTemplate={SelectAllCell} />
)
