import React from 'react';
import shallowEqual from '../utils/shallowEqual.js';
import { TemplateConnector } from './template-connector.jsx';

export class TemplatePlaceholder extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.subscription = {
            retemplate: (id) => {
                if(this.template.id === id)
                    this.forceUpdate();
            }
        }
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
        let { pluginsHost } = this.context;
        pluginsHost.registerSubscription(this.subscription);
    }
    teardownSubscription() {
        let { pluginsHost } = this.context;
        pluginsHost.unregisterSubscription(this.subscription);
    }
    prepareTemplates() {
        let { pluginsHost, templateHost } = this.context;
        let { name, params } = this.props;

        this.params = params || this.context.templateHost && this.context.templateHost.params

        let templates = name 
            ? pluginsHost.collect(name + 'Template')
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