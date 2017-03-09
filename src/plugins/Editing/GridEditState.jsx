import React from 'react';

import { asPluginComponent } from '../pluggable';

const startRowEditReducer = (state, action) => {
    if(action.type === 'GRID_START_EDIT_ROW') {
        let nextState = Object.assign({}, state);
        nextState.editingRows = [...state.editingRows || [], action.payload.row.id];
        return nextState;
    }
    return state;
};

const saveRowChangesReducer = (state, action) => {
    if(action.type === 'GRID_SAVE_ROW_CHANGES') {
        let nextState = Object.assign({}, state);
        nextState.editingRows.splice(nextState.editingRows.indexOf(action.payload.row.id), 1);
        return nextState;
    }
    return state;
};

const cancelRowChangesReducer = (state, action) => {
    if(action.type === 'GRID_CANCEL_ROW_CHANGES') {
        let nextState = Object.assign({}, state);
        nextState.editedCells = Object.assign({}, nextState.editedCells);
        delete nextState.editedCells[action.payload.row.id];
        nextState.editingRows.splice(nextState.editingRows.indexOf(action.payload.row.id), 1);
        return nextState;
    }
    return state;
};

const cellValueChangeReducer = (state, action) => {
    if(action.type === 'GRID_CELL_VALUE_CHANGE') {
        let { value, row, column } = action.payload;
        let nextState = Object.assign({}, state);
        nextState.editedCells = nextState.editedCells || {};
        let editedRow = nextState.editedCells[row.id] = nextState.editedCells[row.id] || {};
        editedRow[column.field] = value;
        return nextState;
    }
    return state;
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
            editingRowsSelector: (original, host) => state => state.editingRows || [],
            editedCellsSelector: (original, host) => state => state.editedCells || {},
            rowsSelector: (original, host) => enhanceRowsSelector(original, host),
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