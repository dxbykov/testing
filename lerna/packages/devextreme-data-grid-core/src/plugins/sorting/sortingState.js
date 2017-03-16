function toggleColumnSorting(state, columnName) {
    let sorting = state.filter(s => { return s.column == columnName; })[0];
    return [
        {
            column: columnName,
            ascending: !sorting || !sorting.ascending
        }
    ];    
}

export const dataGridSortingStatePlugin = (propsGetter = () => ({})) => {
    let state = [];

    return {
        sortingsGetter: () => state,
        toggleColumnSortingAction: columnName => {
            let { onToggleColumnSorting, onSortingsChanged } = propsGetter();
            onToggleColumnSorting && onToggleColumnSorting(columnName);
            state = toggleColumnSorting(state, columnName);
            onSortingsChanged && onSortingsChanged(state);
        }
    }
};
