import { dataGridSortingStatePlugin as sortPlugin } from './sortingState';

describe('dataGridSortingStatePlugin', () => {
    test('#sortingsGetter', () => {
        let plugin = sortPlugin();
        expect(plugin.sortingsGetter().length).toBe(0);
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
            plugin = sortPlugin(() => props);

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

});
