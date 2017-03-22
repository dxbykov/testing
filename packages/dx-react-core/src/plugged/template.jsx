import React from 'react';

let globalTemplateId = 0;
export class Template extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.id = globalTemplateId++;
    }
    componentWillMount() {
        let { pluginHost } = this.context;
        let { name, predicate, connectGetters, connectActions, children } = this.props;

        this.plugin = {
            [name + 'Template']: {
                predicate,
                connectGetters,
                connectActions,
                children: () => this.props.children,
                id: this.id
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
        pluginHost.broadcast('retemplate', this.id);
    }
    render() {
        return null;
    }
};
Template.contextTypes = {
    pluginHost: React.PropTypes.object.isRequired,
};