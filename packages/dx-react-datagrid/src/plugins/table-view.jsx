import React from 'react';
import { Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { Table } from '../components/table.jsx';
import memoize from '../utils/memoize.js';

const cellContentTemplate = ({ row, column }) => <TemplatePlaceholder name="tableViewCell" params={{ row, column }} />;

export class TableView extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mRows = memoize((headerRows, bodyRows) => [...headerRows, ...bodyRows]);

        this.trololo = (opapa) => this.opapa = opapa;
        this.ololo = (params) => this.opapa(params)
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows" value={[]}/>
                <Getter name="tableBodyRows" value={(getter) => getter('rows')()}/>
                <Getter name="tableColumns" value={(getter) => getter('columns')()}/>
                <Getter name="tableCellInfo" value={{}}/>

                <Template name="root">
                    <TemplatePlaceholder name="tableView" />
                </Template>
                <Template
                    name="tableView"
                    connectGetters={(getter) => ({
                        rows: (this.mRows)(getter('tableHeaderRows')(), getter('tableBodyRows')()),
                        columns: getter('tableColumns')(),
                        getCellInfo: (() => { this.trololo(getter('tableCellInfo')); return this.ololo; })(),
                    })}>
                    <Table cellContentTemplate={cellContentTemplate} />
                </Template>
                <Template name="tableViewCell">
                    {({ row, column }) => (row[column.name] !== undefined ? <span>{row[column.name]}</span> : null)}
                </Template>
            </div>
        )
    }
}