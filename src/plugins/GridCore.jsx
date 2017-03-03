import React from 'react';

// TODO use reselect here
const rowsSelector = (state, props) => {
    return props.rows || [];
}

const gridCorePlugin = {
    // reducers: {
    //     test: original => state => state
    // },
    selectors: {
        rowsSelector: original => (state, props) => {
            return rowsSelector(state, props);
        },
        columnsSelector: original => (state, props, selectors) => props.columns || []
    }
}

export default gridCorePlugin;