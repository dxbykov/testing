export const setRowSelection = (selection, { rowId, isSelected }) => {
    let selectedRows = selection.slice(),
        selectedIndex = selectedRows.indexOf(rowId);
    
    if(isSelected === undefined) {
        isSelected = selectedIndex === -1;
    }

    if(selectedIndex > -1 && !isSelected) {
        selectedRows.splice(selectedIndex, 1);
    } else if (selectedIndex === -1 && isSelected) {
        selectedRows.push(rowId)
    }

    return selectedRows;
};

export const toggleSelectAll = (selection, { rows, getRowId }) => {
    if(selection.length === rows.length) {
        return [];
    } else {
        return rows.map(getRowId);
    }
};