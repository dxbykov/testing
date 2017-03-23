import React from 'react';
import { Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { Table } from '../components/table.jsx';
import memoize from '../utils/memoize.js';

const cellContentTemplate = ({ row, column }) => <TemplatePlaceholder name="tableViewCell" params={{ row, column }} />;

export class TableView extends React.PureComponent {
    constructor(props) {
        super(props)

        this._tableRows = memoize((tableHeaderRows, tableBodyRows) => [...tableHeaderRows, ...tableBodyRows]);
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows" value={[]}/>
                <Getter name="tableBodyRows"
                    pureComputed={({ rows }) => rows}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                    })}/>
                <Getter name="tableColumns"
                    pureComputed={({ columns }) => columns}
                    connectArgs={(getter) => ({
                        columns: getter('columns')(),
                    })}/>

                <Template name="root">
                    <TemplatePlaceholder name="tableView" />
                </Template>
                <Template
                    name="tableView"
                    connectGetters={(getter) => ({
                        rows: this._tableRows(getter('tableHeaderRows')(), getter('tableBodyRows')()),
                        columns: getter('tableColumns')(),
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