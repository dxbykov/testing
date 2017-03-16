export const dataGridCorePlugin = (propsGetter) => {
    return {
        exports: {
            rowsGetter: () => propsGetter().rows,
            columnsGetter: () => propsGetter().columns
        }
    }
};
