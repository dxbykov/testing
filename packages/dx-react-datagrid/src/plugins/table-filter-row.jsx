import React from 'react';
import { Getter, Template } from '@devexpress/dx-react-core';
import { filterStateForColumn } from './filter-state.jsx';

export class TableFilterRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this._tableHeaderRows = ({ tableHeaderRows }) => [...tableHeaderRows, { type: 'filter', id: 'filter' }];
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows"
                    pureComputed={this._tableHeaderRows}
                    connectArgs={(getter) => ({
                        tableHeaderRows: getter('tableHeaderRows')(),
                    })}/>

                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'filter' && !column.type}
                    connectGetters={(getter, { column }) => ({
                        filter: filterStateForColumn(column.name, getter('filters')()),
                    })}
                    connectActions={(action, { column }) => ({
                        changeFilter: (value) => action('setColumnFilter')({ columnName: column.name, value }),
                    })}>
                    {({ filter, changeFilter }) => this.props.filterCellTemplate({ filter, changeFilter })}
                </Template>
            </div>
        )
    }
};