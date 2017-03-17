function toggleColumnSorting(state, columnName) {
    let sorting = state.filter(s => { return s.column == columnName; })[0];
    return [
        {
            column: columnName,
            ascending: !sorting || !sorting.ascending
        }
    ];    
}

const nope = () => ({});

export const dataGridSortingStatePlugin = (options = {}) => {
    let { hostGetter = nope, propsGetter = nope } = options;
    let state = propsGetter().defaultSortings || [];

    const setState = nextState => {
        if(state !== nextState) {
            state = nextState;
            const broadcast = hostGetter().broadcast;
            broadcast && broadcast('forceUpdate');
        }
    };

    return {
        sortingsGetter: () => propsGetter().sortings || state,
        toggleColumnSortingAction: columnName => {
            let { onToggleColumnSorting, onSortingsChanged } = propsGetter();
            onToggleColumnSorting && onToggleColumnSorting(columnName);
            setState(toggleColumnSorting(state, columnName));
            onSortingsChanged && onSortingsChanged(state);
        }
    }
};
