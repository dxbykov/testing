import React from 'react';

import { asPluginComponent } from '../pluggable';

const startRowEditReducer = (state, action) => {
    let nextState = Object.assign({}, state);
    nextState.editingRows = [...state.editingRows || [], action.payload.row.id];
    return nextState;
};

const saveRowChangesReducer = (state, action) => {
    let nextState = Object.assign({}, state);
    nextState.editingRows.splice(nextState.editingRows.indexOf(action.payload.row.id), 1);
    return nextState;
};

const cancelRowChangesReducer = (state, action) => {
    let nextState = Object.assign({}, state);
    nextState.editingRows.splice(nextState.editingRows.indexOf(action.payload.row.id), 1);
    return nextState;
};

const cellValueChangeReducer = (state, action) => {
    let { value, row, column } = action.payload;
    let nextState = Object.assign({}, state);
    nextState.editedCells = nextState.editedCells || {};
    let editedRow = nextState.editedCells[row.id] = nextState.editedCells[row.id] || {};
    editedRow[column.field] = value;
    return nextState;
};

const tableRowsSelector = ({ selectors }, original) => {
    let { editingRowsSelector, editedCellsSelector } = selectors;
    let editingIds = editingRowsSelector();
    let editedCells = editedCellsSelector();
    return original().map(row => {
        if(editingIds.indexOf(row.id) > -1) {
            return {
                type: 'editing',
                ...Object.assign({}, row, editedCells[row.id] || {})
            }
        }
        return row;
    });
}

export const gridHeaderSortingPlugin = () => {
    return {
        selectors: {
            tableRowsSelector: (original, host) => () => tableRowsSelector(host, original),
            editingRowsSelector: (original, host) => () => host.selectors.stateSelector().editingRows || [],
            editedCellsSelector: (original, host) => () => host.selectors.stateSelector().editedCells || {},
        },
        actionCreators: {
            startRowEdit: (original, host) => ({ row }) => ({ type: 'GRID_START_EDIT_ROW', payload: { row } }),
            saveRowChanges: (original, host) => ({ row }) => ({ type: 'GRID_SAVE_ROW_CHANGES', payload: { row } }),
            cancelRowChanges: (original, host) => ({ row }) => ({ type: 'GRID_CANCEL_ROW_CHANGES', payload: { row } }),
            cellValueChangeEdit: (original, host) => (args) => ({ type: 'GRID_CELL_VALUE_CHANGE', payload: args }),
        },
        reducers: {
            'GRID_START_EDIT_ROW': (original, host) => startRowEditReducer,
            'GRID_SAVE_ROW_CHANGES': (original, host) => saveRowChangesReducer,
            'GRID_CANCEL_ROW_CHANGES': (original, host) => cancelRowChangesReducer,
            'GRID_CELL_VALUE_CHANGE': (original, host) => cellValueChangeReducer,
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);