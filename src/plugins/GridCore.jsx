import React from 'react';

import { asPluginComponent } from './pluggable';

// TODO use reselect here
const rowsSelector = ({ selectors }) => {
    let props = selectors.propsSelector();
    return props.rows || [];
}

export const gridCorePlugin = () => {
    return {
        selectors: {
            rowsSelector: (original, host) => () => rowsSelector(host),
            columnsSelector: (original, host) => () => host.selectors.propsSelector().columns || []
        }
    };
}

//TODO think of interface declaration, strict injection of imports
gridCorePlugin.Imports = {
    selectors: {
        propsSelector: React.PropTypes.func.isRequired
    }
};

gridCorePlugin.Exports = {
    selectors: {
        rowsSelector: React.PropTypes.func.isRequired,
        columnsSelector: React.PropTypes.func.isRequired
    }
};

export default asPluginComponent(gridCorePlugin);