import React from 'react';
import shallowEqual from '../utils/shallowEqual.js';

export class TemplatePlaceholder extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.subscription = () => this.forceUpdate();
    }
    componentWillUnmount() {
        this.teardownSubscription();
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.props.params, nextProps.params);
    }
    render() {
        this.teardownSubscription();
        this.prepareTemplates();
        this.setupSubscription();

        let { children, connectGetters, connectActions } = this.template;
        return <TemplateConnector params={this.params} mapProps={connectGetters} mapActions={connectActions} content={children()} />
    }
    getChildContext() {
        return {
            templateHost: {
                templates: this.restTemplates,
                params: this.params
            }
        }
    }
    setupSubscription() {
        this.template.subscriptions.push(this.subscription);
    }
    teardownSubscription() {
        if(this.template) {
            this.template.subscriptions.splice(this.template.subscriptions.indexOf(this.subscription), 1);
        }
    }
    prepareTemplates() {
        let { pluginsHost, templateHost } = this.context;
        let { plugins } = pluginsHost;
        let { name, params } = this.props;

        this.params = params || this.context.templateHost && this.context.templateHost.params

        let templates = name 
            ? plugins
                .map(plugin => plugin[name + 'Template'])
                .filter(template => !!template)
                .filter(template => template.predicate ? template.predicate(params) : true)
                .reverse()
            : templateHost.templates;

        this.template = templates[0];
        this.restTemplates = templates.slice(1);
    }
};
TemplatePlaceholder.childContextTypes = {
    templateHost: React.PropTypes.object.isRequired,
};
TemplatePlaceholder.contextTypes = {
    templateHost: React.PropTypes.object,
    pluginsHost: React.PropTypes.object.isRequired,
};

class TemplateConnector extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        let { mapProps, mapActions, params } = props;
        let { pluginsHost } = context;

        this.state = {
            props: mapProps ? mapProps((name) => pluginsHost.get(name + 'Getter'), params) : {},
            actions: mapActions ? mapActions((name) => pluginsHost.get(name + 'Action'), params) : {},
        };
    }
    updateMappings(props) {
        let { mapProps, mapActions, params } = props;
        let { pluginsHost } = this.context;

        this.setState({ 
            props: mapProps ? mapProps((name) => pluginsHost.get(name + 'Getter'), params) : {},
            actions: mapActions ? mapActions((name) => pluginsHost.get(name + 'Action'), params, (name) => pluginsHost.get(name + 'Getter')) : {},
        })
    }
    componentWillReceiveProps(nextProps) {
        this.updateMappings(nextProps);
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.state.props, nextState.props) || this.props.content !== nextProps.content;
    }
    componentDidMount() {
        let { pluginsHost } = this.context;

        this.plugin = {
            reconnect: () => this.updateMappings(this.props)
        }

        if(this.props.mapProps)
            pluginsHost.register(this.plugin);
    }
    componentWillUnmount() {
        let { pluginsHost } = this.context;

        if(this.props.mapProps)
            pluginsHost.unregister(this.plugin)
    }
    render() {
        let { content, params } = this.props;
        let { props, actions } = this.state;
        let mapped = Object.assign({}, params, props, actions);
        return React.isValidElement(content) ? React.cloneElement(content, mapped) : (content ? content(mapped) : null);
    }
};
TemplateConnector.contextTypes = {
    pluginsHost: React.PropTypes.object.isRequired,
};

export class Template extends React.PureComponent {
    componentWillMount() {
        let { pluginsHost } = this.context;
        let { name, predicate, connectGetters, connectActions, children } = this.props;

        this.plugin = {
            [name + 'Template']: {
                predicate,
                connectGetters,
                connectActions,
                children: () => this.props.children,
                subscriptions: []
            }
        };

        pluginsHost.register(this.plugin);
    }
    componentWillUnmount() {
        let { pluginsHost } = this.context;

        pluginsHost.unregister(this.plugin)
    }
    componentDidUpdate() {
        this.plugin[this.props.name + 'Template'].subscriptions.forEach(subscription => subscription());
    }
    render() {
        return null;
    }
};
Template.contextTypes = {
    pluginsHost: React.PropTypes.object.isRequired,
};