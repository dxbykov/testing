import React from 'react';

import { asPluginComponent } from './pluggable';

// TODO use reselect here
const createColumnsSelector = (original, { selectors }) => state => {
    let columns = original && original(state);
    let props = selectors.propsSelector();
    if(columns.length) {
        return columns; 
    }
    else if(props.columns) {
        return props.columns;
    }
    else {
        let { rows } = props;
        return rows.length ? Object.keys(rows[0]).map(c => ({ field: c })) : [];
    }
}

export const gridAutoColumnsPlugin = () => {
    return {
        selectors: {
            columnsSelector: (original, host) => {
                return createColumnsSelector(original, host);
            }
        }
    };
}

export default asPluginComponent(gridAutoColumnsPlugin);