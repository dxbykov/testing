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

const initialState = [];

const orderChangeReducer = (host, state = initialState, action) => {
    //Use some immutability lib here
    let nextState = Object.assign({}, state);
    nextState.columnOrder = calcOrders(action.payload.column, action.payload.diff, (state.columnFilters || initialState/* TODO */), host.selectors.tableColumnsSelector());
    return nextState;
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

const reorderColumns = ({ selectors }, original) => {
    let { columnOrderSelector } = selectors;
    return reorder(original(), columnOrderSelector());
}

export const gridColumnOrderStatePlugin = () => {
    return {
        selectors: {
            columnOrderSelector: (original, host) => () => (host.selectors.stateSelector().columnOrder || initialState/* TODO */),
            //TODO move to data processors
            tableColumnsSelector: (original, host) => () => reorderColumns(host, original)
        },
        actionCreators: {
            reorderColumn: (original, host) => ({ column, diff }) => ({ type: 'GRID_COLUMN_ORDER_CHANGE', payload: { column, diff } })
        },
        reducers: {
            'GRID_COLUMN_ORDER_CHANGE': (original, host) => orderChangeReducer.bind(null, host)
        }
    };
}

export default asPluginComponent(gridColumnOrderStatePlugin);