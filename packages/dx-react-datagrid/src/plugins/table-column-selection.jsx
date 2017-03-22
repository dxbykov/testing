import React from 'react';
import { Getter, Template } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';
import { SelectAllCell } from '../components/select-all-cell.jsx';
import { SelectCell } from '../components/select-cell.jsx';

export class TableColumnSelection extends React.PureComponent {
    constructor(props) {
        super(props);
        
        this._columns = memoize((columns) => [{ type: 'select', name: 'select', width: 20 }, ...columns]);
    }
    render() {
        return (
            <div>
                <Getter name="tableColumns" value={(original) => this._columns(original())}/>

                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => column.type === 'select' && row.type === 'heading'}
                    connectGetters={(getter) => {
                        const rows = getter('rows')();
                        const selection = getter('selection')();
                        return {
                            rows,
                            allSelected: selection.length === rows.length,
                            someSelected: selection.length !== rows.length && selection.length !== 0,
                        }
                    }}
                    connectActions={(action) => ({
                        toggleAll: (rows) => action('toggleAllSelection')({ rows }),
                    })}>
                    {({ allSelected, someSelected, toggleAll, rows }) =>
                        <SelectAllCell allSelected={allSelected} someSelected={someSelected} toggleAll={() => toggleAll(rows)}/>}
                </Template>
                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => column.type === 'select' && !row.type}
                    connectGetters={(getter, { row }) => ({
                        selected: getter('selection')().indexOf(row.id) > -1,
                    })}
                    connectActions={(action, { row }) => ({
                        toggleSelected: (rows) => action('toggleRowSelection')({ row }),
                    })}>
                    {({ selected, toggleSelected }) => (
                        <SelectCell selected={selected} changeSelected={toggleSelected} />
                    )}
                </Template>
            </div>
        )
    }
};