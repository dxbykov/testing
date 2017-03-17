import { dataGridCorePlugin } from './core';

describe('dataGridCorePlugin', () => {
    
    test('#rowsGetter', () => {
        let gridProps = { rows: [] },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin({ propsGetter });

        expect(plugin.rowsGetter()).toBe(gridProps.rows);
    });

    test('#columnsGetter', () => {
        let gridProps = { columns: [] },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin({ propsGetter });

        expect(plugin.columnsGetter()).toBe(gridProps.columns);
    });

    test('#columnsGetter unspecified columns', () => {
        let gridProps = { },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin({ propsGetter });

        expect(plugin.columnsGetter().length).toBe(0);
    });

    test('#columnsGetter auto columns', () => {
        let gridProps = { rows: [ { field1: 1, field2: 2 } ] },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin({ propsGetter });

        let columns = plugin.columnsGetter();
        expect(columns.length).toBe(2);
        expect(columns[0].name).toBe('field1');
        expect(columns[1].name).toBe('field2');
    });

});
