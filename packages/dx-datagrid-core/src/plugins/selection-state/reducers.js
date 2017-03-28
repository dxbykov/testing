export const setRowSelection = (selection, { rowId, isSelected }) => {
    let selectedRows = selection.slice(),
        selectedIndex = selectedRows.indexOf(rowId);
    
    if(selectedIndex > -1) {
        selectedRows.splice(selectedIndex, 1);
    } else if (selectedIndex === -1) {
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