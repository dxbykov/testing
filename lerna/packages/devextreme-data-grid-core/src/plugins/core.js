function getColumns(propsGetter) {
    const props = propsGetter();
    const rows = props.rows;
    let columns = props.columns;
    
    if(!columns && rows && rows.length) {
        columns = Object.keys(rows[0]).map(name => ({ name }));
    }

    return columns || [];
}

export const dataGridCorePlugin = (propsGetter) => {
    return {
        rowsGetter: () => propsGetter().rows,
        columnsGetter: () => getColumns(propsGetter)
    }
};
