import React from 'react';
import { Template } from '@devexpress/dx-react-core';
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
        const  { tableTemplate, rowTemplate, cellTemplate } = this.props;
        const Table = tableTemplate;

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
                    <Table
                        getCellInfo={this._getCellInfo}
                        cellContentTemplate={cellContentTemplate}
                        cellTemplate={cellTemplate}
                        rowTemplate={rowTemplate} />
                </Template>
            </div>
        );
    }
}