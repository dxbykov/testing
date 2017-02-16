// state controllers

const calcSortings = (columnName, prevSorting) => {
    let sorting = prevSorting.filter(s => { return s.column == columnName; })[0];
    return [
        {
            column: columnName,
            direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc'
        }
    ];
};

export function sortingStateController(getProps, setState) {
    return {
        onSort: (columnName) => {
            let { sortings } = getProps(),
                nextSortings = calcSortings(columnName, sortings);

            setState({ sortings: nextSortings });
        }
    };
}

const calcGrouping = (prevGrouping, columnName) => {
    let grouping = prevGrouping.slice(),
        colGrouping = grouping.filter(g => g.column === columnName)[0];

    if(colGrouping) {
        grouping.splice(grouping.indexOf(colGrouping), 1);
    }
    else {
        grouping.push({
            column: columnName
        });
    }
    return grouping;
}

export function groupStateController(getProps, setState) {
    return {
        groupChange: (columnName) => {
            let { grouping } = getProps(),
                nextGrouping = calcGrouping(grouping, columnName);
            
            setState({ grouping: nextGrouping });
        }
    };
}

export const pagingHelper = {
    getCurrentPage: (totalCount, pageSize, currentPage) => {
        let totalPages = Math.ceil(totalCount / pageSize),
            lastPageIndex = totalPages - 1;

        return Math.min(lastPageIndex, currentPage);
    }
};

export function pagingStateController(getProps, setState) {
    return {
        pageChange: (page) => {
            setState({ page });
        },
        pageSizeChange: (pageSize) => {
            setState({ pageSize });
        }
    };
}

// data processing

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

const paginate = ({ originalRows, pageSize, page }) => {
    return originalRows.slice(pageSize * page, pageSize * (page + 1));
};

export function dataPagingController(getProps) {
    return  () => {
        return paginate(getProps());
    }
}

const flatten = (rows) => {
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

const group = (originalRows, grouping, shape) => {
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
            g.rows = group(g.rows, nextGrouping, shape);
        });
    }

    return shape(groups);
};

export function dataGroupingController(getProps) {
    return  () => {
        let { originalRows, grouping } = getProps();
        return group(originalRows, grouping, flatten);
    };
}
