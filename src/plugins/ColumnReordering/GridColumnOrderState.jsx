import React from 'react';

import { asPluginComponent } from '../pluggable';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sign = (value) => value / Math.abs(value);
const calcOrders = (columnName, diff, prevOrders, columns) => {
    let result = prevOrders.slice();
    if(!result.length) {
        result = columns.filter(column => !column.type).map((column, index) => ({ column: column.field, position: index }));
    }
    let changed = result.find(column => column.column === columnName);
    let fromPosition = changed.position;
    let toPosition = changed.position + diff;
    changed.position = toPosition;
    result.forEach(order => {
        if(order === changed) return; 
        if(clamp(order.position, Math.min(fromPosition, toPosition), Math.max(fromPosition, toPosition)) === order.position) {
            order.position = order.position - sign(diff);
        }
    })
    return result;
};

const orderChangeReducer = (state, action) => {
    if(action.type === 'GRID_COLUMN_ORDER_CHANGE') {
        let nextState = Object.assign({}, state);
        nextState.columnOrder = calcOrders(action.payload.column, action.payload.diff, state.columnFilters, action.payload.columns);
        return nextState;
    }
    return Object.assign({ columnOrder: [] }, state);
};

const columnDragStart = (state, action) => {
    if(action.type === 'GRID_COLUMN_DRAG_START') {
        let nextState = Object.assign({}, state);
        nextState.draggingColumn = action.payload.column.field;
        return nextState;
    }
    return Object.assign({ }, state);
};

const columnDragEnd = (state, action) => {
    if(action.type === 'GRID_COLUMN_DRAG_END') {
        let nextState = Object.assign({}, state);
        nextState.draggingColumn = null;
        return nextState;
    }
    return Object.assign({ }, state);
};

const reorder = (columns, orders) => {
    if(!orders.length)
        return columns;

    return columns.sort((a, b) => {
        let aOrder = orders.find(o => a.field === o.column);
        let bOrder = orders.find(o => b.field === o.column);

        if(aOrder && bOrder) {
            return aOrder.position - bOrder.position;
        } else {
            return 0
        }
    });
};

export const gridColumnOrderStatePlugin = () => {
    return {
        selectors: {
            tableColumnsSelector: (original, host) => (state) => reorder(original(state), state.columnOrder)
        },
        actionCreators: {
            reorderColumn: (original, host) => ({ column, diff, columns }) => ({ type: 'GRID_COLUMN_ORDER_CHANGE', payload: { column, diff, columns } }),
            columnDragStart: (original, host) => ({ column }) => ({ type: 'GRID_COLUMN_DRAG_START', payload: { column } }),
            columnDragEnd: (original, host) => () => ({ type: 'GRID_COLUMN_DRAG_END' })
        },
        reducers: {
            'GRID_COLUMN_ORDER_CHANGE': (original, host) => orderChangeReducer,
            'GRID_COLUMN_DRAG_START': (original, host) => columnDragStart,
            'GRID_COLUMN_DRAG_END': (original, host) => columnDragEnd
        }
    };
}

export default asPluginComponent(gridColumnOrderStatePlugin);