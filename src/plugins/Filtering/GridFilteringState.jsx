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

const initialState = [];

const filterChangeReducer = (state = initialState, action) => {
    //Use some immutability lib here
    let nextState = Object.assign({}, state);
    nextState.columnFilters = calcFilters(action.payload.column.field, action.payload.value, (state.columnFilters || initialState/* TODO */));
    return nextState;
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

const filterRows = ({ selectors }, original) => {
    let { columnFiltersSelector } = selectors;
    return filter(original(), columnFiltersSelector());
}

export const gridHeaderSortingPlugin = () => {
    return {
        selectors: {
            columnFiltersSelector: (original, host) => () => (host.selectors.stateSelector().columnFilters || initialState/* TODO */),
            //TODO move to data processors
            rowsSelector: (original, host) => () => filterRows(host, original)
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