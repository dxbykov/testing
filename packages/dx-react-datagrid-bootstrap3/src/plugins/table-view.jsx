import React from 'react';
import { TableView as TableViewBase } from '@devexpress/dx-react-datagrid';
import { Table, TableRow, TableCell } from '../templates/table.jsx';
import { Layout } from '../templates/layout.jsx';

export const TableView = ({ getCellInfo, cellContentTemplate }) => (
    <div>
        <TableViewBase 
            getCellInfo={getCellInfo}
            tableTemplate={Table}
            rowTemplate={TableRow}
            cellTemplate={TableCell}
            cellContentTemplate={cellContentTemplate} />
        <Layout />
    </div>
);