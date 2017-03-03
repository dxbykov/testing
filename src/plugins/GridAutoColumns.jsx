import React from 'react';

import { asPluginComponent } from './pluggable';

// TODO use reselect here
const columnsSelector = (original, { selectors }) => {
    let columns = original && original();
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
            columnsSelector: (original, host) => () => {
                return columnsSelector(original, host);
            }
        }
    };
}

export default asPluginComponent(gridAutoColumnsPlugin);