export const paginate = (rows, pageSize, page) => {
    return rows.slice(pageSize * page, pageSize * (page + 1));
};

export const ensurePageHeaders = (rows, pageSize) => {
    let result = rows.slice(),
        currentIndex = pageSize;

    while(result.length > currentIndex) {
        let row = result[currentIndex],
            parentRows = [];
        
        while(row._parentRow) {
            parentRows.unshift(row._parentRow);
            row = row._parentRow;
        }
        
        if(parentRows.length) {
            result.splice(currentIndex, 0, ...parentRows);
        }

        currentIndex += pageSize;
    }

    return result;
};
