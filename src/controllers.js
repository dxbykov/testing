import { sorty } from './index';

// state controllers

export function sortingStateController({ getProps, setState }) {
    let calcSortings = (columnName, prevSortings) => {
        let sorting = prevSortings.filter(s => { return s.column == columnName; })[0];
        return [ { column: columnName, direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc' } ]
    };

    return {
        props: () => {
            return {
                onSort: (columnName) => {
                    let { sortings } = getProps(),
                        nextSortings = calcSortings(columnName, sortings);

                    setState({ sortings: nextSortings });
                }
            };
        }
    };
}

export function groupStateController({ getProps, setState }) {
    return {
        props: () => {
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
    };
}

export function pagingStateController({ getProps, setState }) {
    let page = ({ totalCount, pageSize, page }) => {
        let totalPages = Math.ceil(totalCount / pageSize),
            lastPageIndex = totalPages - 1;

        return (lastPageIndex < page) ? lastPageIndex : page;
    };

    return {
        props: () => {
            return {
                pageChange: (page) => {
                    setState({ page });
                },
                pageSizeChange: (pageSize) => {
                    setState({ pageSize });
                },
                page: page(getProps())
            };
        }
    };
}

// data processing

export function dataSortingController({ getProps }) {
    let sort = ({ originalRows, sortings }) => {
        return sorty(originalRows, sortings);
    };

    return {
        props: () => {
            return {
                sortedRows: sort(getProps())
            };
        }
    };
}

export function dataPagingController({ getProps }) {
    let paginate = ({ originalRows, pageSize, page }) => {
        let visibleRows = originalRows.slice(pageSize * page, pageSize * (page + 1));
        return visibleRows;
    };
    return  {
        props: () => {
            return {
                visibleRows: paginate(getProps())
            };
        }
    };
}

export function dataGroupingController({ getProps }) {
    let flatten = (rows) => {
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

    let group = (originalRows, grouping) => {
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
                g.rows = group(g.rows, nextGrouping);
            });
        }

        return flatten(groups);
    };

    return  {
        props: () => {
            let props = getProps();
            return {
                groupedRows: group(props.originalRows, props.grouping)
            };
        }
    };
}
