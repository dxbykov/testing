import React from 'react';
import { Template } from '@devexpress/dx-react-core';
import { Table } from '../components/table.jsx';
import { TableViewBase, cellContentTemplate } from './table-view-base.jsx';
import memoize from '../utils/memoize.js';

export class TableView extends React.PureComponent {
    constructor(props) {
        super(props)

        this._tableRows = memoize((tableHeaderRows, tableBodyRows) => [...tableHeaderRows, ...tableBodyRows]);
        this._getCellInfo = ({ row, column, columnIndex, columns }) => {
            if(row.colspan !== undefined && columnIndex > row.colspan)
                return { skip: true };
            const colspan = row.colspan === columnIndex ? columns.length - row.colspan : 1;
            return { colspan };
        };
    }
    render() {
        return (
            <div>
                <TableViewBase />

                <Template
                    name="tableView"
                    connectGetters={(getter) => ({
                        rows: this._tableRows(getter('tableHeaderRows')(), getter('tableBodyRows')()),
                        columns: getter('tableColumns')(),
                    })}>
                    <Table getCellInfo={this._getCellInfo} cellContentTemplate={cellContentTemplate} />
                </Template>
            </div>
        );
    }
}