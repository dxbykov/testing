import React from 'react';

// TODO use reselect here
const columnsSelector = (state, props, selectors, original) => {
    let columns = original && original(state, props, selectors);
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

const gridAutoColumnsPlugin = {
    // reducers: {
    //     test: original => state => state
    // },
    selectors: {
        columnsSelector: original => (state, props, selectors) => {
            return columnsSelector(state, props, selectors, original);
        }
    }
}

export default gridAutoColumnsPlugin;