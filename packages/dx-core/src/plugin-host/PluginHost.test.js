import { PluginHost } from './PluginHost';

describe('PluginHost', () => {
    let host;

    beforeEach(() => {
        host = new PluginHost();
    });

    test('#ctor', () => {
        expect(host.plugins.length).toBe(0);
    });

    test('#register', () => {
        let plugin = {};
        
        host.register(plugin);
        
        expect(host.plugins.length).toBe(1);
        expect(host.plugins[0]).toBe(plugin);
    });

    test('#unregister', () => {
        let plugin = {};
        
        host.register(plugin);
        expect(host.plugins.length).toBe(1);
        
        host.unregister(plugin);
        expect(host.plugins.length).toBe(0);
    });

    test('#broadcast', () => {
        let plugin = {
            onMessage: jest.fn()
        };
        
        host.register(plugin);
        host.broadcast('onMessage', 'update');
        expect(plugin.onMessage.mock.calls.length).toBe(1);
        expect(plugin.onMessage.mock.calls[0].length).toBe(1);
        expect(plugin.onMessage.mock.calls[0][0]).toBe('update');
    });

    test('#get', () => {
        let plugin = {
            something: 123
        };
        
        host.register(plugin);
        expect(host.get('something')).toBe(123);
    });

    test('#get with extender', () => {
        let plugin1 = {
            something: '1'
        };
        let plugin2 = {
            somethingExtender: original => original + '2'
        };
        let plugin3 = {
            somethingExtender: original => original + '3'
        };
        
        host.register(plugin1);
        host.register(plugin2);
        host.register(plugin3);
        expect(host.get('something')).toBe('123');
    });

});
