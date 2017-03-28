export const setDetailRowExpanded = (prevExpanded, { rowId, isExpanded }) => {
    let expandedRows = prevExpanded.slice(),
        expandedIndex = expandedRows.indexOf(rowId);
    
    if(isExpanded === undefined) {
        isExpanded = expandedIndex === -1;
    }

    if(expandedIndex > -1 && !isExpanded) {
        expandedRows.splice(expandedIndex, 1);
    } else if (expandedIndex === -1 && isExpanded) {
        expandedRows.push(rowId)
    }

    return expandedRows;
};
