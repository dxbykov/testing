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
    broadcast(event, message) {
        this.plugins.forEach(plugin => plugin[event] && plugin[event](message));
    }
    get(key) {
        let result;
        
        this.plugins.forEach(plugin => {
            let value = plugin[key];
            if(value !== undefined) {
                result = value;
            }
        });

        this.plugins.forEach(plugin => {
            let value = plugin[key + 'Extender'];
            if(value !== undefined) {
                result = value(result);
            }
        });
        
        return result;
    }
}
