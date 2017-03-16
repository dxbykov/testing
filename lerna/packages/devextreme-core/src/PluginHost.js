export class PluginHost {
    constructor() {
        this.plugins = [];
    }
    register(plugin) {
        this.plugins.push(plugin);
    }
    unregister(plugin) {
        this.plugins.splice(this.plugins.indexOf(plugin), 1);
    }
    broadcast(message) {
        this.plugins.forEach(plugin => plugin.onMessage && plugin.onMessage(message));
    }
    get(key) {
        let result;
        
        this.plugins.forEach(plugin => {
            if(plugin.exports) {
                let value = plugin.exports[key];
                if(value !== undefined) {
                    result = value;
                }
            }
        });

        this.plugins.forEach(plugin => {
            if(plugin.exports) {
                let value = plugin.exports[key + 'Extender'];
                if(value !== undefined) {
                    result = value(result);
                }
            }
        });
        
        return result;
    }
}
