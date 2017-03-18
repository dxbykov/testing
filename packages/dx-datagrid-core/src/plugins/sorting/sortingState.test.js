import { dataGridSortingStatePlugin } from './sortingState';
import { immutableMutator } from '@devexpress/dx-core';

describe('dataGridSortingStatePlugin', () => {
    
    let sortPlugin = (options = {}) => {
        return dataGridSortingStatePlugin({
            propsGetter: () => ({}),
            mutator: immutableMutator,
            ...options
        });
    };

    test('#sortingsGetter', () => {
        let plugin = sortPlugin();
        expect(plugin.sortingsGetter().length).toBe(0);
    });

    test('#sortingsGetter with controlled state', () => {
        let props = { sortings: [] },
            plugin = sortPlugin({ propsGetter: () => props });
        
        expect(plugin.sortingsGetter()).toBe(props.sortings);
        plugin.toggleColumnSortingAction('field1');
        expect(plugin.sortingsGetter()).toBe(props.sortings);
    });

    test('#sortingsGetter uncontrolled with default state', () => {
        let props = { defaultSortings: [] },
            plugin = sortPlugin({ propsGetter: () => props });
        
        expect(plugin.sortingsGetter()).toBe(props.defaultSortings);
        plugin.toggleColumnSortingAction('field1');
        expect(plugin.sortingsGetter()).not.toBe(props.defaultSortings);
    });


    test('#toggleColumnSortingAction changes state', () => {
        let plugin = sortPlugin();
        
        plugin.toggleColumnSortingAction('field1');

        let sortings = plugin.sortingsGetter();
        expect(sortings.length).toBe(1);
        expect(sortings[0].column).toBe('field1');
        expect(sortings[0].ascending).toBeTruthy();

        plugin.toggleColumnSortingAction('field1');

        sortings = plugin.sortingsGetter();
        expect(sortings.length).toBe(1);
        expect(sortings[0].column).toBe('field1');
        expect(sortings[0].ascending).toBeFalsy();
    });

    test('#toggleColumnSortingAction fires events', () => {
        let props = {
                onToggleColumnSorting: jest.fn(),
                onSortingsChanged: jest.fn()
            },
            plugin = sortPlugin({ propsGetter: () => props });

        plugin.toggleColumnSortingAction('field1');
        expect(props.onToggleColumnSorting.mock.calls.length).toBe(1);
        expect(props.onToggleColumnSorting.mock.calls[0][0]).toBe('field1');
        expect(props.onSortingsChanged.mock.calls.length).toBe(1);
        expect(props.onSortingsChanged.mock.calls[0][0]).toBe(plugin.sortingsGetter());
    });

    test('#toggleColumnSortingAction does not mutate state', () => {
        let plugin = sortPlugin();
        
        let sortings = plugin.sortingsGetter();
        plugin.toggleColumnSortingAction('field1');
        expect(sortings).not.toBe(plugin.sortingsGetter());
    });

    test('#toggleColumnSortingAction notifies host on state change', () => {
        let host = {
                broadcast: jest.fn()
            },
            plugin = sortPlugin({ hostGetter: () => host });
        
        plugin.toggleColumnSortingAction('field1');
        expect(host.broadcast.mock.calls.length).toBe(1);
        expect(host.broadcast.mock.calls[0][0]).toBe('forceUpdate');
    });

});
