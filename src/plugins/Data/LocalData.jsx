import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

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

export const localDataPlugin = () => {
    return {
        selectors: {
            rowsSelector: (original, host) => createSortRowsSelector(host, original)
        }
    };
}

export default asPluginComponent(localDataPlugin);