import React from 'react';

export class Action extends React.PureComponent {
    componentWillMount() {
        let { pluginsHost } = this.context;
        let { name } = this.props;

        this.plugin = {
            [name + 'Action']: () => (params) => {
                let { action } = this.props;
                action(params, (name) => pluginsHost.get(name + 'Getter'))
            }
        };

        pluginsHost.registerPlugin(this.plugin);
    }
    componentWillUnmount() {
        let { pluginsHost } = this.context;

        pluginsHost.unregisterPlugin(this.plugin);
    }
    render() {
        return null;
    }
};
Action.contextTypes = {
    pluginsHost: React.PropTypes.object.isRequired,
};