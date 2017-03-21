import React from 'react';

export class Getter extends React.PureComponent {
    componentWillMount() {
        let { pluginsHost } = this.context;
        let { name } = this.props;

        this.plugin = {
            [name + 'Getter']: (original) => (params) => {
                let { value } = this.props;
                let args = [(name) => pluginsHost.get(name + 'Getter'), params];
                if(original) args.unshift(original(params))
                return typeof value === "function" ? value.apply(null, args) : value
            }
        };

        pluginsHost.registerPlugin(this.plugin);
    }
    componentWillUnmount() {
        let { pluginsHost } = this.context;

        pluginsHost.unregisterPlugin(this.plugin)
    }
    componentDidUpdate() {
        let { pluginsHost } = this.context;

        pluginsHost.broadcast('reconnect');
    }
    render() {
        return null;
    }
};
Getter.contextTypes = {
    pluginsHost: React.PropTypes.object.isRequired,
};