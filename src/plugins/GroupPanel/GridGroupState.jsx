import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

const groupReducer = (state, action) => {
    let result = state.slice();
    result.push(action.payload.column);
    return result;
};

const ungroupReducer = (state, action) => {
    let result = state.slice();
    result.splice(result.indexOf(action.payload.column), 1);
    return result;
};

const filter = (columns, groups) => {
    return columns.filter(column => groups.indexOf(column.field) === -1);
}

export default asPluginComponent(() => {
    return {
        selectors: {
            tableColumnsSelector: (original, host) => (state) => filter(original(state), state.groups)
        },
        actionCreators: {
            groupByColumn: (original, host) => ({ column }) => ({ type: 'GRID_CROUP_PANEL_GROUP', payload: { column } }),
            ungroupByColumn: (original, host) => ({ column }) => ({ type: 'GRID_CROUP_PANEL_UNGROUP', payload: { column } }),
        },
        reducers: {
            groups: () => createReducer([], {
                'GRID_CROUP_PANEL_GROUP': groupReducer,
                'GRID_CROUP_PANEL_UNGROUP': ungroupReducer
            })
        }
    };
});