function toggleColumnSortingReducer(state, columnName, mutator) {
    let nextState = state;
    let index = state.findIndex(s => s.column == columnName);

    if(index > -1) {
        let sorting = state[index];
        let nextSorting = mutator.set(sorting, 'ascending', !sorting.ascending);
        nextState = mutator.splice(state, index, 1, nextSorting);
    }
    else {
        let nextSorting = {
            column: columnName,
            ascending: true
        };
        nextState = mutator.splice(state, 0, 0, nextSorting);
    }
    return nextState;
}


const nope = () => ({});

export const dataGridSortingStatePlugin = (options = {}) => {
    let { hostGetter = nope, propsGetter = nope, mutator } = options;
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
            setState(toggleColumnSortingReducer(state, columnName, mutator));
            onSortingsChanged && onSortingsChanged(state);
        }
    }
};
