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

const sortChangeReducer = (state = { columnSortings: [] }, action) => {
    if(action.type == 'GRID_COLUMN_SORT_CHANGE') {
        let nextState = Object.assign({}, state || { columnSortings: [] });
        nextState.columnSortings = calcSortings(action.payload.column.field, state.columnSortings);
        return nextState;
    }
    return state;
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

const createSortRowsSelector = ({ selectors }, original) => state => {
    let { columnSortingsSelector } = selectors;
    return sort(original(state), columnSortingsSelector(state));
}

export const gridHeaderSortingPlugin = () => {
    return {
        selectors: {
            columnSortingsSelector: (original, host) => state => state.columnSortings || [],
            //TODO move to data processors
            rowsSelector: (original, host) => createSortRowsSelector(host, original)
        },
        actionCreators: {
            sotrByColumn: (original, host) => ({ column }) => ({ type: 'GRID_COLUMN_SORT_CHANGE', payload: { column } })
        },
        reducers: {
            'GRID_COLUMN_SORT_CHANGE': (original, host) => sortChangeReducer
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);