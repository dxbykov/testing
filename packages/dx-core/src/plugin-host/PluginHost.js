export class PluginHost {
    constructor() {
        this.plugins = [];
        this.cache = {};
    }
    _clearCache() {
        this.cache = {};
    }
    register(plugin) {
        this.plugins.push(plugin);
        this._clearCache();
    }
    unregister(plugin) {
        this.plugins.splice(this.plugins.indexOf(plugin), 1);
        this._clearCache();
    }
    broadcast(event, message) {
        this.plugins.forEach(plugin => plugin[event] && plugin[event](message));
    }
    get(key) {
        let result = this.cache[key];
        
        if(!result) {
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

            this.cache[key] = result;
        }
        
        return result;
    }
}
