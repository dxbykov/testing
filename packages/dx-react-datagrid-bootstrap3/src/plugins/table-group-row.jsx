import React from 'react';
import { TableGroupRow as TableGroupRowBase } from '@devexpress/dx-react-datagrid';
import { GroupRowCell } from '../templates/group-row-cell.jsx';
import { SelectCell } from '../templates/select-cell.jsx';

export const TableGroupRow = () => (
    <TableGroupRowBase
        groupRowCellTemplate={GroupRowCell} />
)

