// data processing

export const pagingHelper = {
    getCurrentPage: (totalCount, pageSize, currentPage) => {
        let totalPages = Math.ceil(totalCount / pageSize),
            lastPageIndex = totalPages - 1;

        return Math.min(lastPageIndex, currentPage);
    }
};

export const sort = (rows, sortings) => {
    if(!sortings.length)
        return rows;

    let sortColumn = sortings[0].column,
        result = rows.slice().sort((a, b) => {
            let value = (a[sortColumn] < b[sortColumn]) ^ sortings[0].direction === "desc"
            return value ? -1 : 1;
        });
    return result;
}

export function dataSortingController(getProps) {
    return () => {
        let { originalRows, sortings } = getProps();
        return sort(originalRows, sortings);
    };
}

export const paginate = (originalRows, pageSize, page) => {
    return originalRows.slice(pageSize * page, pageSize * (page + 1));
};

export function dataPagingController(getProps) {
    return  () => {
        let { originalRows, pageSize, page } = getProps();
        return paginate(originalRows, pageSize, page);
    }
}

export const flatten = (rows) => {
    let result = [];
    
    rows.forEach(r => {
        if(r.isGroupRow) {
            let { rows, ...group } = r;
            result.push(group);
            if(rows) {
                result.push.apply(result, flatten(rows));
            }
        }
        else {
            result.push(r);
        }
    });

    return result;
};

export const group = (originalRows, grouping) => {
    if(!grouping.length) return originalRows;

    let rows = originalRows.slice(),
        groupColumn = grouping[0].column,
        nextGrouping = grouping.slice(1),
        result = [],
        groups = [],
        groupHash = {};

    originalRows.forEach(r => {
        let groupKey = r[groupColumn],
            group;

        if(groupKey in groupHash) {
            group = groupHash[groupKey];
        }
        else {
            group = groupHash[groupKey] = {
                key: groupKey,
                isGroupRow: true,
                column: groupColumn,
                rows: []
            };
            groups.push(group);
        }

        group.rows.push(r);
    });

    if(nextGrouping.length) {
        groups.forEach(g => {
            g.rows = group(g.rows, nextGrouping);
        });
    }

    return groups;
};

/*
//Source

"rows: [
    {
        "key": "Male",
        "isGroupRow": true,
        "column": "sex",
        "rows": [
            {
                "id": 0,
                "name": "Sherlock",
                "sex": "Male",
                "city": "Tula",
                "car": "BMW"
            },
        ]
    }
]"

//Target

rows: [
    { type: 'heading', id: 'ID', name: 'Name' },
    {
        type: 'group', level: 0, value: 'Male',
        items: [
            {
                type: 'group', level: 1, subvalue: 'Male', value: 'A-M',
                items: generateData(20, ['Bob', 'Mark'])
            },
            {
                type: 'group', level: 1, subvalue: 'Male', value: 'M-Z',
                items: generateData(30, ['Poul', 'Tim', 'Steve'], 20)
            }
        ]
    },
    {
        type: 'group', level: 0, value: 'Female',
        items: [
            {
                type: 'group', level: 1, subvalue: 'Female', value: 'A-M',
                items: generateData(25, ['Anna', 'Marry', 'Adel'], 50)
            },
            {
                type: 'group', level: 1, subvalue: 'Female', value: 'M-Z',
                items: generateData(20, ['Nina', 'Nona'], 75)
            }
        ]
    }
],
*/

export const gridGroupShaper = (rows, level = 0, subvalue) => {
    let result = rows.map(row => {
        if(row.isGroupRow) {
            return {
                type: 'group',
                value: row.key,
                level: level,
                subvalue: subvalue,
                items: gridGroupShaper(row.rows, level + 1, row.key),
            };
        }
        else {
            return row;
        }
    });

    return result;
};


export function dataGroupingController(getProps) {
    return  () => {
        let { originalRows, grouping } = getProps();
        return gridGroupShaper(group(originalRows, grouping));
    };
}
