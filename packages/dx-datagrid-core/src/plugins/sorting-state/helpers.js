export const getColumnSortingDirection = (sortings, columnName) => {
    let sorting = sortings.filter(s => s.column === columnName)[0];
    return sorting ? sorting.direction : false;
};
