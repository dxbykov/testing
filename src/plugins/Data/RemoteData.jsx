import React from 'react';

import { asPluginComponent, createReducer } from '../pluggable';

const createRequestParamsSelector = (original, host) => state => {
    let { columnSortingsSelector, columnFiltersSelector } = host.selectors;
    let requestParams = {};
    
    if(columnSortingsSelector) {
        Object.assign(requestParams, { sortings: columnSortingsSelector(state) });
    }
    if(columnFiltersSelector) {
        Object.assign(requestParams, { filters: columnFiltersSelector(state) });
    }

    return requestParams;
};

const createRequestDataEvent = (propsSelector, host) => action => {
    let { requestParamsSelector, rootStateSelector } = host.selectors;
    let state = rootStateSelector(),
        requestData = requestParamsSelector(state);

    propsSelector().onRequestData && propsSelector().onRequestData(requestData);
};

export const remoteDataPlugin = (propsSelector, host) => {
    let requestDataEvent = createRequestDataEvent(propsSelector, host)

    return {
        selectors: {
            requestParamsSelector: (original, host) => createRequestParamsSelector(original, host)
        },
        events: {
            'GRID_COLUMN_SORT_CHANGE_AFTER': () => requestDataEvent,
            'GRID_COLUMN_FILTER_CHANGE_AFTER': () => requestDataEvent
        }
    };
}

export default asPluginComponent(remoteDataPlugin);