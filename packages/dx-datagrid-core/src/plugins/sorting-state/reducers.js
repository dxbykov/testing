export const setColumnSorting = (sortings, { columnName, direction, keepOther }) => {
    let sortingIndex = sortings.findIndex(s => { return s.column == columnName; }),
        sorting = sortings[sortingIndex],
        nextSortings = keepOther ? sortings.slice() : [];

    if(sorting) {
        sorting = Object.assign({}, sorting, { direction: sorting.direction == 'asc' ? 'desc' : 'asc' });
        if(keepOther) {
            nextSortings.splice(sortingIndex, 1, sorting);
        }
        else {
            nextSortings.push(sorting);
        }
        
    }
    else {
        nextSortings.push({
            column: columnName,
            direction: direction || 'asc'
        });
    }

    return nextSortings;
};
