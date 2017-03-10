import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sign = (value) => value / Math.abs(value);
const calcOrders = (columnName, destinationName, prevOrders, columns) => {
    let result = prevOrders.slice();
    if(!result.length) {
        result = columns.filter(column => !column.type).map((column, index) => ({ column: column.field, position: index }));
    }
    let source = result.find(column => column.column === columnName);
    let destination = result.find(column => column.column === destinationName);
    let fromPosition = source.position;
    let toPosition = destination.position;
    let diff = toPosition - fromPosition;
    source.position = toPosition;
    result.forEach(order => {
        if(order === source) return; 
        if(clamp(order.position, Math.min(fromPosition, toPosition), Math.max(fromPosition, toPosition)) === order.position) {
            order.position = order.position - sign(diff);
        }
    })
    return result;
};

const orderChangeReducer = (state, action) => {
    return calcOrders(action.payload.column, action.payload.destination, state, action.payload.columns);
};

const columnDragStart = (state, action) => {
    return action.payload.column.field;
};

const columnDragEnd = (state, action) => {
    return null;
};

const calcGeometries = (columnName, left, width, prevGeometries) => {
    let filterIndex = prevGeometries.findIndex(f => { return f.column == columnName; });
    let result = prevGeometries.slice();
    if(filterIndex > -1) {
        result.splice(filterIndex, 1, { column: columnName, left, width });
    } else {
        result.push({ column: columnName, left, width })
    }
    return result;
};

const columnGeometryUpdateReducer = (state, action) => {
    return calcGeometries(action.payload.column, action.payload.left, action.payload.width, state);
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

export default asPluginComponent(() => {
    return {
        selectors: {
            tableColumnsSelector: (original, host) => (state) => reorder(original(state), state.columnOrder)
        },
        actionCreators: {
            reorderColumn: (original, host) => ({ column, destination, columns }) => ({ type: 'GRID_COLUMN_ORDER_CHANGE', payload: { column, destination, columns } }),
            columnDragStart: (original, host) => ({ column }) => ({ type: 'GRID_COLUMN_DRAG_START', payload: { column } }),
            columnDragEnd: (original, host) => () => ({ type: 'GRID_COLUMN_DRAG_END' }),
            columnGeometryUpdate: (original, host) => ({ column, left, width }) => ({ type: 'GRID_COLUMN_GEOMETRY_UPDATE', payload: { column, left, width } })
        },
        reducers: {
            columnOrder: () => createReducer([], {
                'GRID_COLUMN_ORDER_CHANGE': orderChangeReducer
            }),
            draggingColumn: () => createReducer(null, {
                'GRID_COLUMN_DRAG_START': columnDragStart,
                'GRID_COLUMN_DRAG_END': columnDragEnd
            }),
            columnGeometries: () => createReducer([], {
                'GRID_COLUMN_GEOMETRY_UPDATE': columnGeometryUpdateReducer
            })
        }
    };
});