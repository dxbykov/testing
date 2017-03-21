import React from 'react';

let globalTemplateId = 0;
export class Template extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.id = globalTemplateId++;
    }
    componentWillMount() {
        let { pluginsHost } = this.context;
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
        pluginsHost.registerPlugin(this.plugin);
    }
    componentWillUnmount() {
        let { pluginsHost } = this.context;
        pluginsHost.unregisterPlugin(this.plugin)
    }
    componentDidUpdate() {
        let { pluginsHost } = this.context;
        pluginsHost.broadcast('retemplate', this.id);
    }
    render() {
        return null;
    }
};
Template.contextTypes = {
    pluginsHost: React.PropTypes.object.isRequired,
};