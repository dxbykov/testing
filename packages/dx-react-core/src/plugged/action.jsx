import React from 'react';

export class Action extends React.PureComponent {
    componentWillMount() {
        let { pluginHost } = this.context;
        let { name } = this.props;

        this.plugin = {
            [name + 'Action']: () => (params) => {
                let { action } = this.props;
                action(params, (name) => pluginHost.get(name + 'Getter'))
            }
        };

        pluginHost.registerPlugin(this.plugin);
    }
    componentWillUnmount() {
        let { pluginHost } = this.context;

        pluginHost.unregisterPlugin(this.plugin);
    }
    render() {
        return null;
    }
};
Action.contextTypes = {
    pluginHost: React.PropTypes.object.isRequired,
};