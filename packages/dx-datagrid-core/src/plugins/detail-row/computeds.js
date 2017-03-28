export const expandedDetailRows = (rows, expandedRows) => {
    expandedRows.filter((value, index, self) => self.indexOf(value) === index).forEach(rowId => {
        let index = rows.findIndex(row => row.id === rowId);
        if(index !== -1) {
            let rowIndex = rows.findIndex(row => row.id === rowId);
            let insertIndex = rowIndex + 1
            let row = rows[rowIndex];
            rows = [
                ...rows.slice(0, insertIndex),
                { type: 'detailRow', id: 'detailRow_' + row.id, for: row, colspan: 0, height: 'auto' },
                ...rows.slice(insertIndex)
            ];
        }
    });
    return rows;
};
