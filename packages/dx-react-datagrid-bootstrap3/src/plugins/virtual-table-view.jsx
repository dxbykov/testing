import React from 'react';
import { TableView as TableViewBase } from '@devexpress/dx-react-datagrid';
import { VirtualTable } from '../templates/virtual-table.jsx';
import { Layout } from '../templates/layout.jsx';

export const VirtualTableView = ({ getCellInfo, cellContentTemplate }) => (
    <div>
        <TableViewBase
            getCellInfo={getCellInfo}
            tableTemplate={VirtualTable}
            cellContentTemplate={cellContentTemplate} />
        <Layout />
    </div>
);