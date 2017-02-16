import { sorty } from './index';

// state controllers

const calcSortings = (columnName, prevSortings) => {
    let sorting = prevSortings.filter(s => { return s.column == columnName; })[0];
    return [ { column: columnName, direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc' } ]
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

export function groupStateController(getProps, setState) {
    return {
        groupChange: (columnName) => {
            let grouping = getProps().grouping,
                colGrouping = grouping.filter(g => g.column === columnName)[0];

            grouping = grouping.slice();
            if(colGrouping) {
                grouping.splice(grouping.indexOf(colGrouping), 1);
            }
            else {
                grouping.push({
                    column: columnName
                });
            }
            setState({ grouping: grouping });
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

const sort = ({ originalRows, sortings }) => {
    return sorty(originalRows, sortings);
};

export function dataSortingController(getProps) {
    return () => {
        return sort(getProps());
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
            groupHash[groupKey] = group = {
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
        let props = getProps();
        return group(props.originalRows, props.grouping, flatten);
    };
}
