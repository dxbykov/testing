import React from 'react';

import { asPluginComponent } from './pluggable';

// TODO use reselect here
const columnsSelector = (selectors, original) => {
    let columns = original && original(selectors);
    let props = selectors.propsSelector();
    if(columns.length) {
        return columns; 
    }
    else if(props.columns) {
        return props.columns;
    }
    else {
        let { rows } = props;
        return rows.length ? Object.keys(rows[0]) : [];
    }
}

export const gridAutoColumnsPlugin = () => {
    return {
        // reducers: {
        //     test: original => state => state
        // },
        selectors: {
            columnsSelector: (original, selectors) => () => {
                return columnsSelector(selectors, original);
            }
        }
    };
}

export default asPluginComponent(gridAutoColumnsPlugin);