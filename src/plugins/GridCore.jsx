import React from 'react';

import { asPluginComponent } from './pluggable';

// TODO use reselect here
const rowsSelector = (selectors) => {
    let props = selectors.propsSelector();
    return props.rows || [];
}

export const gridCorePlugin = () => {
    return {
        // reducers: {
        //     test: original => state => state
        // },
        selectors: {
            rowsSelector: (original, selectors) => () => rowsSelector(selectors),
            columnsSelector: (original, selectors) => () => selectors.propsSelector().columns || []
        }
    };
}

export default asPluginComponent(gridCorePlugin);