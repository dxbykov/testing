import React from 'react';
import { VirtualTableView as VirtualTableViewBase } from '@devexpress/dx-react-datagrid';
import { Layout } from '../templates/layout.jsx';

export const VirtualTableView = ({ getCellInfo, cellContentTemplate }) => (
    <div>
        <VirtualTableViewBase
            getCellInfo={getCellInfo}
            cellContentTemplate={cellContentTemplate} />
        <Layout />
    </div>
);