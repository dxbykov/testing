function getColumns(propsGetter) {
    const props = propsGetter();
    const rows = props.rows;
    let columns = props.columns;
    
    if(!columns && rows && rows.length) {
        columns = Object.keys(rows[0]).map(name => ({ name }));
    }

    return columns || [];
}

const nope = () => ({});

export const dataGridCorePlugin = (options = {}) => {
    let { propsGetter = nope } = options;
    
    return {
        rowsGetter: () => propsGetter().rows,
        columnsGetter: () => getColumns(propsGetter)
    }
};
