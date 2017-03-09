import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

const startEditRowReducer = (state, action) => {
    return [...state, action.payload.row.id];
};

const stopEditRowReducer = (state, action) => {
    let nextState = state.slice()
    nextState.splice(state.indexOf(action.payload.row.id), 1);
    return nextState;
};

const cancelRowChangesReducer = (state, action) => {
    let nextState = Object.assign({}, state);
    delete nextState[action.payload.row.id];
    return nextState;
};

const cellValueChangeReducer = (state, action) => {
    let { value, row, column } = action.payload;
    let nextState = Object.assign({}, state);
    let editedRow = nextState[row.id] = nextState[row.id] || {};
    editedRow[column.field] = value;
    return nextState;
};

const enhanceTableRowsSelector = (original, { selectors }) => state => {
    let { editingRowsSelector, editedCellsSelector } = selectors;
    let editingIds = editingRowsSelector(state);
    let editedCells = editedCellsSelector(state);
    return original(state).map(row => {
        if(editingIds.indexOf(row.id) > -1) {
            return {
                type: 'editing',
                ...Object.assign({}, row, editedCells[row.id] || {})
            }
        }
        return row;
    });
}

const enhanceRowsSelector = (original, { selectors }) => state => {
    let { editingRowsSelector, editedCellsSelector } = selectors;
    let editingIds = editingRowsSelector(state);
    let editedCells = editedCellsSelector(state);
    return original(state).map(row => {
        if(row.id in editedCells) {
            return Object.assign({}, row, { _isDirty: true }, editedCells[row.id]);
        }
        return row;
    });
};

export const gridHeaderSortingPlugin = () => {
    return {
        selectors: {
            tableRowsSelector: (original, host) => enhanceTableRowsSelector(original, host),
            editingRowsSelector: (original, host) => state => state.editingRows,
            editedCellsSelector: (original, host) => state => state.editedCells,
            rowsSelector: (original, host) => enhanceRowsSelector(original, host),
        },
        actionCreators: {
            startRowEdit: (original, host) => ({ row }) => ({ type: 'GRID_START_EDIT_ROW', payload: { row } }),
            saveRowChanges: (original, host) => ({ row }) => ({ type: 'GRID_SAVE_ROW_CHANGES', payload: { row } }),
            cancelRowChanges: (original, host) => ({ row }) => ({ type: 'GRID_CANCEL_ROW_CHANGES', payload: { row } }),
            cellValueChangeEdit: (original, host) => (args) => ({ type: 'GRID_CELL_VALUE_CHANGE', payload: args }),
        },
        reducers: {
            editingRows: () => createReducer([], {
                'GRID_START_EDIT_ROW': startEditRowReducer,
                'GRID_SAVE_ROW_CHANGES': stopEditRowReducer,
                'GRID_CANCEL_ROW_CHANGES': stopEditRowReducer
            }),
            editedCells: () => createReducer({}, {
                'GRID_CANCEL_ROW_CHANGES': cancelRowChangesReducer,
                'GRID_CELL_VALUE_CHANGE': cellValueChangeReducer,
            })
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);