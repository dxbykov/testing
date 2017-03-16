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

});
