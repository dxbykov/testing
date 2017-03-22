import React from 'react';
import { Getter } from '@devexpress/dx-react-core';

export class TableHeaderRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this._tableHeaderRows = ({ tableHeaderRows, columns }) => {
            return [columns.reduce((accum, c) => {
                accum[c.name] = c.title;
                return accum;
            }, { type: 'heading' }), ...tableHeaderRows]
        };
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows"
                    pureComputed={this._tableHeaderRows}
                    connectArgs={(getter) => ({
                        tableHeaderRows: getter('tableHeaderRows')(),
                        columns: getter('columns')(),
                    })}/>
            </div>
        )
    }
};