export class PluginHost {
    constructor() {
        this._plugins = [];
        this._subscriptions = [];
        this._gettersCache = {};
    }

    registerPlugin(plugin) {
        this._plugins.push(plugin);
        this.cleanPluginsCache();
    }
    unregisterPlugin(plugin) {
        this._plugins.splice(this._plugins.indexOf(plugin), 1);
        this.cleanPluginsCache();
    }
    cleanPluginsCache() {
        this._gettersCache = {};
    }
    collect(key, upTo) {
        if(!this._gettersCache[key]) {
            this._gettersCache[key] = this._plugins.map(plugin => plugin[key]).filter(plugin => !!plugin);
        }
        if(!upTo) return this._gettersCache[key];

        const upToIndex = this._plugins.indexOf(upTo);
        return this._gettersCache[key].filter(getter => {
            const pluginIndex = this._plugins.findIndex(plugin => plugin[key] === getter);
            return pluginIndex < upToIndex;
        });
    }
    get(key, upTo) {
        let plugins = this.collect(key, upTo);
        
        let result = plugins[0]();
        plugins.slice(1).forEach(plugin => result = plugin(result));
        return result;
    }

    registerSubscription(subscription) {
        let index = this._subscriptions.indexOf(subscription);
        if(index === -1)
            this._subscriptions.push(subscription);
    }
    unregisterSubscription(subscription) {
        let index = this._subscriptions.indexOf(subscription);
        if(index !== -1)
            this._subscriptions.splice(this._subscriptions.indexOf(subscription), 1);
    }
    broadcast(event, message) {
        this._subscriptions.forEach(subscription => subscription[event] && subscription[event](message));
    }
}
