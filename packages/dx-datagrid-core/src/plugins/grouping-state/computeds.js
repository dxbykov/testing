const groupRows = (originalRows, grouping, parentGroup) => {
    if(!grouping.length) return originalRows;

    let rows = originalRows.slice(),
        groupColumn = grouping[0].column,
        nextGrouping = grouping.slice(1),
        result = [],
        groups = [],
        groupHash = {};

    originalRows.forEach(r => {
        let groupKey = r[groupColumn].toString(),
            group;

        if(groupKey in groupHash) {
            group = groupHash[groupKey];
        }
        else {
            group = groupHash[groupKey] = {
                key: (parentGroup ? parentGroup.key + '_' : '') + groupKey,
                colspan: (parentGroup ? parentGroup.colspan + 1 : 0),
                value: groupKey,
                type: 'groupRow',
                column: groupColumn,
                rows: [],
            };
            if(parentGroup) {
                group._parentRow = parentGroup;
            }
            groups.push(group);
        }

        group.rows.push(Object.assign({}, r, { _parentRow: group }));
    });

    if(nextGrouping.length) {
        groups.forEach(group => {
            group.rows = groupRows(group.rows, nextGrouping, group);
        });
    }

    return groups;
};

export const groupedRows = (rows, grouping) => {
  return groupRows(rows, grouping);
};

const expandGroups = (groupedRows, expandedGroups) => {
    let result = groupedRows.slice().map(row => {
        if(row.type === 'groupRow' && expandedGroups[row.key]) {
            return [
                row,
                ...expandGroups(row.rows, expandedGroups)
            ];
        }
        return [ row ];
    }).reduce((acc, val) => acc.concat(val), []);

    return result;
};

export const expandedGroupRows = (groupedRows, expandedGroups) => {
    return expandGroups(groupedRows, expandedGroups);
};

