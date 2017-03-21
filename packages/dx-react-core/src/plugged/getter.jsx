import React from 'react';

export class Getter extends React.PureComponent {
    componentWillMount() {
        let { pluginsHost } = this.context;
        let { name } = this.props;

        this.plugin = {
            [name + 'Getter']: (params) => {
                let { value } = this.props;
                return typeof value === "function" ? value((name) => pluginsHost.get(name + 'Getter'), params) : value
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

export class GetterExtender extends React.PureComponent {
    componentWillMount() {
        let { pluginsHost } = this.context;
        let { name } = this.props;

        this.plugin = {
            [name + 'GetterExtender']: (original) => (params) => {
                let { value } = this.props;
                return typeof value === "function" ? value(original(params), (name) => pluginsHost.get(name + 'Getter'), params) : value
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
GetterExtender.contextTypes = {
    pluginsHost: React.PropTypes.object.isRequired,
};