import React from 'react';
import { Getter } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';

export class TableHeaderRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this._tableHeaderRows = memoize((rows, columns) => {
            return [columns.reduce((accum, c) => {
                accum[c.name] = c.title;
                return accum;
            }, { type: 'heading' }), ...rows]
        });
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows" value={(rows, getter) => (this._tableHeaderRows)(rows, getter('columns')())}/>
            </div>
        )
    }
};