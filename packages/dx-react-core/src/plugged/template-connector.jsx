import React from 'react';
import shallowEqual from '../utils/shallowEqual.js';

export class TemplateConnector extends React.PureComponent {
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

        this.subscription = {
            reconnect: () => this.updateMappings(this.props)
        }

        if(this.props.mapProps)
            pluginsHost.registerSubscription(this.subscription);
    }
    componentWillUnmount() {
        let { pluginsHost } = this.context;

        if(this.props.mapProps)
            pluginsHost.unregisterSubscription(this.subscription)
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