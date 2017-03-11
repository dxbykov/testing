import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

const calcSortings = (columnName, prevSorting) => {
    let sorting = prevSorting.filter(s => s.column == columnName)[0];
    return [
        {
            column: columnName,
            direction: (sorting && sorting.direction == 'asc') ? 'desc' : 'asc'
        }
    ];
};

const sortChangeReducer = (state, action) => {
    return calcSortings(action.payload.column.field, state);
};

export const gridHeaderSortingPlugin = () => {
    return {
        selectors: {
            columnSortingsSelector: (original, host) => state => state.columnSortings || []
        },
        actionCreators: {
            sotrByColumn: (original, host) => ({ column }) => ({ type: 'GRID_COLUMN_SORT_CHANGE', payload: { column } })
        },
        reducers: {
            columnSortings: () => createReducer([], {
                'GRID_COLUMN_SORT_CHANGE': sortChangeReducer
            })
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);