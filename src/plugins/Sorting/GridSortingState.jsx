import React from 'react';

import { asPluginComponent } from '../pluggable';

const calcSortings = (columnName, prevSorting) => {
    let sorting = prevSorting.filter(s => s.column == columnName)[0];
    return [
        {
            column: columnName,
            direction: (sorting && sorting.direction == 'asc') ? 'desc' : 'asc'
        }
    ];
};

const initialState = [];

const sortChangeReducer = (state = initialState, action) => {
    //Use some immutability lib here
    let nextState = Object.assign({}, state);
    nextState.columnSortings = calcSortings(action.payload.column.field, (state.columnSortings || initialState/* TODO */));
    return nextState;
};

const sort = (rows, sortings) => {
    if(!sortings.length)
        return rows;

    let sortColumn = sortings[0].column,
        result = rows.slice().sort((a, b) => {
            let value = (a[sortColumn] < b[sortColumn]) ^ sortings[0].direction === "desc"
            return value ? -1 : 1;
        });
    return result;
};

const sortRows = ({ selectors }, original) => {
    let { columnSortingsSelector } = selectors;
    return sort(original(), columnSortingsSelector());
}

export const gridHeaderSortingPlugin = () => {
    return {
        selectors: {
            columnSortingsSelector: (original, host) => () => host.selectors.stateSelector().columnSortings || [],
            //TODO move to data processors
            rowsSelector: (original, host) => () => sortRows(host, original)
        },
        actionCreators: {
            sotrByColumn: (original, host) => ({ column }) => ({ type: 'GRID_COLUMN_SORT_CHANGE', payload: { column } })
        },
        reducers: {
            GRID_COLUMN_SORT_CHANGE: (original, host) => sortChangeReducer
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);