import React from 'react';
import { Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { Table } from '../components/table.jsx';
import { WindowedScroller } from '../components/windowed-scroller.jsx';
import { VirtualTable } from '../components/virtual-table.jsx';
import memoize from '../utils/memoize.js';

const cellContentTemplate = ({ row, column }) => <TemplatePlaceholder name="tableViewCell" params={{ row, column }} />;

export class VirtualTableView extends React.PureComponent {
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
                <Template name="tableViewCell">
                    {({ row, column }) => (row[column.name] !== undefined ? <span>{row[column.name]}</span> : null)}
                </Template>
            </div>
        );
    }
}