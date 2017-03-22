import React from 'react';
import shallowEqual from '../utils/shallowEqual.js';
import { RERENDER_TEMPLATE } from './template.jsx';
import { TemplateConnector } from './template-connector.jsx';

export class TemplatePlaceholder extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.subscription = {
            [RERENDER_TEMPLATE]: (id) => {
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
        let { pluginHost } = this.context;
        pluginHost.registerSubscription(this.subscription);
    }
    teardownSubscription() {
        let { pluginHost } = this.context;
        pluginHost.unregisterSubscription(this.subscription);
    }
    prepareTemplates() {
        let { pluginHost, templateHost } = this.context;
        let { name, params } = this.props;

        this.params = params || this.context.templateHost && this.context.templateHost.params;

        let templates = name 
            ? pluginHost.collect(name + 'Template')
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
    pluginHost: React.PropTypes.object.isRequired,
};