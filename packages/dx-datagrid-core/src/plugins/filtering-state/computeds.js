export const filteredRows = (rows, filters) => {
    if(!filters.length)
        return rows;

    return rows.filter(row => filters.reduce((accumulator, filter) => {
        return accumulator && String(row[filter.column]).toLowerCase().indexOf(filter.value.toString().toLowerCase()) > -1;
    }, true));
};
