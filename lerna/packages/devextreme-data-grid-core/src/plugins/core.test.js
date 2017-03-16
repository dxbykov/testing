import { dataGridCorePlugin } from './core';
import { PluginHost } from '@devexpress/devextreme-core';

describe('dataGridCorePlugin', () => {
    let host;

    beforeEach(() => {
        host = new PluginHost();
    });

    test('#rowsGetter', () => {
        let gridProps = { rows: [] },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin(propsGetter);

        host.register(plugin);

        expect(host.get('rowsGetter')()).toBe(gridProps.rows);
    });

    test('#columnsGetter', () => {
        let gridProps = { columns: [] },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin(propsGetter);

        host.register(plugin);

        expect(host.get('columnsGetter')()).toBe(gridProps.columns);
    });

    test('#columnsGetter unspecified columns', () => {
        let gridProps = { },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin(propsGetter);

        host.register(plugin);

        expect(host.get('columnsGetter')().length).toBe(0);
    });

    test('#columnsGetter auto columns', () => {
        let gridProps = { rows: [ { field1: 1, field2: 2 } ] },
            propsGetter = () => gridProps,
            plugin = dataGridCorePlugin(propsGetter);

        host.register(plugin);

        let columns = host.get('columnsGetter')();
        expect(columns.length).toBe(2);
        expect(columns[0].name).toBe('field1');
        expect(columns[1].name).toBe('field2');
    });

});
