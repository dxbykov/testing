import React from 'react';
import { Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { Table } from '../components/table.jsx';
import memoize from '../utils/memoize.js';

const cellContentTemplate = ({ row, column }) => <TemplatePlaceholder name="tableViewCell" params={{ row, column }} />;

export class TableView extends React.PureComponent {
    constructor(props) {
        super(props)

        this._tableRows = memoize((headerRows, bodyRows) => [...headerRows, ...bodyRows]);

        this._cacheTableCellInfo = (tableCellInfo) => this._cachedTableCellInfo = tableCellInfo;
        this._tableCellInfoCacher = (params) => this._cachedTableCellInfo(params)
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows" value={[]}/>
                <Getter name="tableBodyRows" value={(getter) => getter('rows')()}/>
                <Getter name="tableColumns" value={(getter) => getter('columns')()}/>
                <Getter name="tableCellInfo" value={{}}/>

                {/*Computed*/}
                <Getter name="tableRows" value={(getter) => (this._tableRows)(getter('tableHeaderRows')(), getter('tableBodyRows')())}/>

                <Template name="root">
                    <TemplatePlaceholder name="tableView" />
                </Template>
                <Template
                    name="tableView"
                    connectGetters={(getter) => ({
                        rows: getter('tableRows')(),
                        columns: getter('tableColumns')(),
                        getCellInfo: (() => { this._cacheTableCellInfo(getter('tableCellInfo')); return this._tableCellInfoCacher; })(),
                    })}>
                    <Table cellContentTemplate={cellContentTemplate} />
                </Template>
                <Template name="tableViewCell">
                    {({ row, column }) => (row[column.name] !== undefined ? <span>{row[column.name]}</span> : null)}
                </Template>
            </div>
        );
    }
}