import React from 'react';
import { Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { Table } from '../components/table.jsx';
import { WindowedScroller } from '../components/windowed-scroller.jsx';
import { VirtualTable } from '../components/virtual-table.jsx';
import { TableViewBase, cellContentTemplate } from './table-view-base.jsx';
import memoize from '../utils/memoize.js';

export class VirtualTableView extends React.PureComponent {
    render() {
        return (
            <div>
                <TableViewBase />
                
                <Template
                    name="tableView"
                    connectGetters={(getter) => ({
                        headerRows: getter('tableHeaderRows')(),
                        bodyRows: getter('tableBodyRows')(),
                        columns: getter('tableColumns')(),
                    })}>
                    {({ headerRows, bodyRows, columns }) => (
                        <div style={{ height: '400px' }}>
                            <WindowedScroller>
                                <VirtualTable headerRows={headerRows} bodyRows={bodyRows} columns={columns} cellContentTemplate={cellContentTemplate} />
                            </WindowedScroller>
                        </div>
                    )}
                </Template>
            </div>
        );
    }
}