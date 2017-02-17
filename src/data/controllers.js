// sorting state controller

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

// grouping state controller

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

// paging state controller

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

// expanded state controller

const toggleExpanded = (prevExpandedRows, rowId) => {
    let expandedRows = prevExpandedRows.slice(),
        expandedIndex = expandedRows.indexOf(rowId);
    
    if(expandedIndex > -1) {
        expandedRows.splice(expandedIndex, 1);
    } else if (expandedIndex === -1) {
        expandedRows.push(rowId)
    }

    return expandedRows;
};

export function expandedStateController(getProps, setState) {
    return {
        isExpanded: (rowId) => {
            let { expandedRows } = getProps();
            return expandedRows.indexOf(rowId) > -1
        },
        toggleExpanded: (rowId) => {
            let { expandedRows } = getProps(),
                nextExpandedRows = toggleExpanded(expandedRows, rowId);
            
            setState({ expandedRows: nextExpandedRows });
        }
    };
}
