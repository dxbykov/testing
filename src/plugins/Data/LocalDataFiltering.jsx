import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

const filter = (rows, filters) => {
    if(!filters.length)
        return rows;

    return rows.filter((row) => {
        return filters.reduce((accumulator, filter) => {
            return accumulator && String(row[filter.column]).toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
        }, true);
    });
};

const createfilterRowsSelector = (original) => state => {
    return filter(original(state), state.columnFilters);
}

export const localDataFilteringPlugin = () => {
    return {
        selectors: {
            rowsSelector: (original, host) => createfilterRowsSelector(original, host)
        }
    };
}

export default asPluginComponent(localDataFilteringPlugin);