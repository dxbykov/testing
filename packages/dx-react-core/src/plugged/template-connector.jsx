import React from 'react';
import { shallowEqual } from '../utils/shallowEqual.js';
import { UPDATE_CONNECTION } from './getter.jsx';

export class TemplateConnector extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = this.mappedBindings(props);

        this.subscription = {
            [UPDATE_CONNECTION]: () => this.setState(this.mappedBindings(this.props))
        };
    }
    mappedBindings(props) {
        let { mapProps, mapActions, params } = props;
        let { pluginHost } = this.context;

        let mappedProps = {};
        if(mapProps) {
            mappedProps = mapProps((name) => pluginHost.get(name + 'Getter'), params);
        }

        let mappedActions = {};
        if(mapActions) {
            mappedActions = mapActions((name) => pluginHost.get(name + 'Action'), params);
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
        return !shallowEqual(this.props.params, nextProps.params)
            || !shallowEqual(this.state.props, nextState.props)
            || this.props.content !== nextProps.content;
    }
    componentDidMount() {
        this.updateConnection();
    }
    componentDidUpdate() {
        this.updateConnection();
    }
    updateConnection() {
        let { pluginHost } = this.context;
        if(this.props.mapProps) {
            pluginHost.registerSubscription(this.subscription);
        } else {
            pluginHost.unregisterSubscription(this.subscription);
        }
    }
    componentWillUnmount() {
        let { pluginHost } = this.context;
        pluginHost.unregisterSubscription(this.subscription);
    }
    render() {
        let { content, params } = this.props;
        let { props, actions } = this.state;

        let mapped = Object.assign({}, params, props, actions);
        return React.isValidElement(content) ? React.cloneElement(content, mapped) : (content ? content(mapped) : null);
    }
};
TemplateConnector.contextTypes = {
    pluginHost: React.PropTypes.object.isRequired,
};