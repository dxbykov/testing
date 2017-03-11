import React from 'react';

import { asPluginComponent } from './pluggable';

// TODO use reselect here
const createRowsSelector = ({ selectors }) => state => {
    let props = selectors.rootPropsSelector();
    return props.rows || [];
}

export const gridCorePlugin = () => {
    return {
        selectors: {
            rowsSelector: (original, host) => createRowsSelector(host),
            columnsSelector: (original, host) => state => host.selectors.rootPropsSelector().columns || []
        }
    };
}

//TODO think of interface declaration, strict injection of imports
gridCorePlugin.Imports = {
    selectors: {
        rootPropsSelector: React.PropTypes.func.isRequired
    }
};

gridCorePlugin.Exports = {
    selectors: {
        rowsSelector: React.PropTypes.func.isRequired,
        columnsSelector: React.PropTypes.func.isRequired
    }
};

export default asPluginComponent(gridCorePlugin);