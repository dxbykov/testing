import React from 'react';
import { GetterExtender, Template } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';

export class TableFilterRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this._tableHeaderRows = memoize((rows) => [...rows, { type: 'filter' }]);
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableHeaderRows" value={this._tableHeaderRows}/>

                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'filter' && !column.type}
                    connectGetters={(getter, { column }) => ({
                        filter: getter('filterFor')({ columnName: column.name }),
                    })}
                    connectActions={(action, { column }) => ({
                        changeFilter: (value) => action('setColumnFilter')({ columnName: column.name, value }),
                    })}>
                    {({ filter, changeFilter }) => (
                        <input
                            type="text"
                            value={filter}
                            onChange={(e) => changeFilter(e.target.value)}
                            style={{ width: '100%' }}/>
                    )}
                </Template>
            </div>
        )
    }
};