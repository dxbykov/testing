import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const filterFor = (columnName, filters) => {
    if(!filters.length)
        return '';
    let filter = filters.filter(s => s.column === columnName)[0];
    return filter ? filter.value : '';
};

const GridFilterCellView = ({ column, filterChange, filters }) => (
    <input
        type="text"
        value={filterFor(column.field, filters)}
        onChange={(e) => filterChange({ column, value: e.target.value })}
        style={{ width: '100%' }}/>
);

let GridFilterCellContainer = connectIoC(
    connect(
        (state, props) => ({
            filters: state.columnFilters
        }),
        (dispatch, props) => ({
            filterChange: args => {
                let { filterColumn } = props;
                let { column, value } = args;
                dispatch(filterColumn({ column, value }));
            }
        })
    )(GridFilterCellView),
    ioc => ({
        filterColumn: ioc.actionCreators.filterColumn,
        columnFiltersSelector: ioc.selectors.columnFiltersSelector
    })
);

const renderCellContent = ({ row, column }, original) => {
    if(row.type === 'filter' && !column.type) {
        return <GridFilterCellContainer row={row} column={column} />
    }
    return original({ row, column });
};

export default asPluginComponent(() => {
    return {
        components: {
            renderCellContent: (original, host) => ({ row, column }) => renderCellContent({ row, column }, original)
        },
        selectors: {
            tableRowsSelector: (original, host) => state => [original(state)[0], { type: 'filter' }, ...original(state).slice(1)]
        }
    };
});