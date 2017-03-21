import React from 'react';
import shallowEqual from '../utils/shallowEqual.js';

export class TemplateConnector extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = this.mappedBindings(props);

        this.subscription = {
            reconnect: () => this.setState(this.mappedBindings(this.props))
        };
    }
    mappedBindings(props) {
        let { mapProps, mapActions, params } = props;
        let { pluginsHost } = this.context;

        let mappedProps = {};
        if(mapProps) {
            mappedProps = mapProps((name) => pluginsHost.get(name + 'Getter'), params);
        }

        let mappedActions = {};
        if(mapActions) {
            mappedActions = mapActions((name) => pluginsHost.get(name + 'Action'), params);
        }

        return {
            props: mappedProps,
            actions: mappedActions,
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState(this.mappedBindings(nextProps));
    }
    shouldComponentUpdate(nextProps, nextState) {
        return !shallowEqual(this.state.props, nextState.props) || this.props.content !== nextProps.content;
    }
    componentDidMount() {
        this.updateConnection();
    }
    componentDidUpdate() {
        this.updateConnection();
    }
    updateConnection() {
        let { pluginsHost } = this.context;
        if(this.props.mapProps) {
            pluginsHost.registerSubscription(this.subscription);
        } else {
            pluginsHost.unregisterSubscription(this.subscription);
        }
    }
    componentWillUnmount() {
        let { pluginsHost } = this.context;
        pluginsHost.unregisterSubscription(this.subscription);
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