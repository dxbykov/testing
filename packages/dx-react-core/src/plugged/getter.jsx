import React from 'react';

export class Getter extends React.PureComponent {
    componentWillMount() {
        let { pluginHost } = this.context;
        let { name } = this.props;

        this.plugin = {
            [name + 'Getter']: (original) => (params) => {
                let { value } = this.props;
                let args = [(name) => pluginHost.get(name + 'Getter'), params];
                if(original) args.unshift(original(params))
                return typeof value === "function" ? value.apply(null, args) : value
            }
        };

        pluginHost.registerPlugin(this.plugin);
    }
    componentWillUnmount() {
        let { pluginHost } = this.context;

        pluginHost.unregisterPlugin(this.plugin)
    }
    componentDidUpdate() {
        let { pluginHost } = this.context;

        pluginHost.broadcast('reconnect');
    }
    render() {
        return null;
    }
};
Getter.contextTypes = {
    pluginHost: React.PropTypes.object.isRequired,
};