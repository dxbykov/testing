import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

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
    return calcFilters(action.payload.column.field, action.payload.value, state);
};

export const gridHeaderSortingPlugin = () => {
    return {
        actionCreators: {
            filterColumn: (original, host) => ({ column, value }) => ({ type: 'GRID_COLUMN_FILTER_CHANGE', payload: { column, value } })
        },
        reducers: {
            columnFilters: () => createReducer([], {
                'GRID_COLUMN_FILTER_CHANGE': filterChangeReducer
            })
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);