export const groupByColumn = (prevGrouping, { columnName, groupIndex }) => {
    let grouping = prevGrouping.slice(),
        index = grouping.findIndex(g => g.column === columnName);

    if(index > -1) {
        grouping.splice(index, 1);
    }
    else if(groupIndex === undefined) {
        groupIndex = grouping.length;
    }
    
    if(groupIndex > -1) {
        grouping.splice(groupIndex, 0, {
            column: columnName
        });
    }
    
    return grouping;
};