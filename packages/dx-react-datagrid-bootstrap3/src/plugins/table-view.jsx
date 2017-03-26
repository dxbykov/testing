import React from 'react';
import { TableView as TableViewBase } from '@devexpress/dx-react-datagrid';
import { Table, TableRow, TableCell } from '../templates/table.jsx';

export const TableView = ({ getCellInfo, cellContentTemplate }) => (
    <TableViewBase 
        getCellInfo={getCellInfo}
        tableTemplate={Table}
        rowTemplate={TableRow}
        cellTemplate={TableCell}
        cellContentTemplate={cellContentTemplate} />
);