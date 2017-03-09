import React from 'react';

import { asPluginComponent } from '../pluggable';

const calcFilters = (columnName, value, prevFilters) => {
    let filterIndex = prevFilters.findIndex(f => { return f.column == columnName; });
    let result = prevFilters.slice();
    if(filterIndex > -1) {
        result.splice(filterIndex, 1, { column: columnName, value: value });
    } else {
        result.push({ column: columnName, value: value })
    }
    return result;
};

const filterChangeReducer = (state, action) => {
    if(action.type === 'GRID_COLUMN_FILTER_CHANGE') {
        let nextState = Object.assign({}, state);
        nextState.columnFilters = calcFilters(action.payload.column.field, action.payload.value, (state.columnFilters || initialState/* TODO */));
        return nextState;
    }
    return state || { columnFilters: [] };
};

const filter = (rows, filters) => {
    if(!filters.length)
        return rows;

    return rows.filter((row) => {
        return filters.reduce((accumulator, filter) => {
            return accumulator && String(row[filter.column]).toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
        }, true);
    });
};

const createfilterRowsSelector = (original, { selectors }) => state => {
    let { columnFiltersSelector } = selectors;
    return filter(original(state), columnFiltersSelector(state));
}

export const gridHeaderSortingPlugin = () => {
    return {
        selectors: {
            columnFiltersSelector: (original, host) => state => state.columnFilters,
            //TODO move to data processors
            rowsSelector: (original, host) => createfilterRowsSelector(original, host)
        },
        actionCreators: {
            filterColumn: (original, host) => ({ column, value }) => ({ type: 'GRID_COLUMN_FILTER_CHANGE', payload: { column, value } })
        },
        reducers: {
            'GRID_COLUMN_FILTER_CHANGE': (original, host) => filterChangeReducer
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);