import React from 'react';
import { Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';

export const cellContentTemplate = ({ row, column }) => <TemplatePlaceholder name="tableViewCell" params={{ row, column }} />;

export class TableViewBase extends React.PureComponent {
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

                <Template name="gridBody">
                    <TemplatePlaceholder name="tableView" />
                </Template>
                <Template name="tableViewCell">
                    {({ row, column }) => (row[column.name] !== undefined ? <span>{row[column.name]}</span> : null)}
                </Template>
            </div>
        );
    }
}