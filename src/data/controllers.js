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

const directionFor = (columnName, sortings) => {
    let sorting = sortings.filter(s => s.column === columnName)[0];
    return sorting ? sorting.direction : false;
};

export function sortingStateController(getProps, setState) {
    return {
        directionFor: (columnName) => {
            let { sortings } = getProps();
            return directionFor(columnName, sortings);
        },
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

// selection state controller

const calcSelection = (prevSelection, rowId) => {
    let selectedRows = prevSelection.slice(),
        selectedIndex = selectedRows.indexOf(rowId);
    
    if(selectedIndex > -1) {
        selectedRows.splice(selectedIndex, 1);
    } else if (selectedIndex === -1) {
        selectedRows.push(rowId)
    }

    return selectedRows;
};

const toggleSelectAll = (prevSelection, rows, getRowId) => {
    if(prevSelection.length === rows.length) {
        return [];
    } else {
        return rows.map(getRowId);
    }
};

//TODO it's similar to expanded state
export function selectionStateController(getProps, setState) {
    return {
        selectedChange: (rowId) => {
            let { selection } = getProps(),
                nextSelection = calcSelection(selection, rowId);

            setState({ selection: nextSelection });
        },
        //TODO should we recieve an array of keys instad? Why is it not passed via the props? 
        selectedAllChange: (rows, getRowId) => {
            let { selection } = getProps(),
                nextSelection = toggleSelectAll(selection, rows, getRowId);

            setState({ selection: nextSelection });
        },
        isSelected: (rowId) => {
            let { selection } = getProps();
            return selection.indexOf(rowId) > -1;
        }
    };
}

