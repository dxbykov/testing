import React from 'react';

const addPluginToHost = (plugin, host) => {
    Object.keys(plugin).forEach(extensionType => {
        if(!host[extensionType]) {
            host[extensionType] = {};
        }
        
        Object.keys(plugin[extensionType]).forEach(key => {
            let original = host[extensionType][key],
                enhancer = plugin[extensionType][key];

            host[extensionType][key] = enhancer(original, host);
        });
    });
};

export const asPluginComponent = plugin => React.createClass({
    contextTypes: {
        gridHost: React.PropTypes.object.isRequired
    },
    componentWillMount: function() {
        const { gridHost } = this.context;
        addPluginToHost(plugin(this.props), gridHost);
    },
    render: function() {
        return null;
    }
})

export const connectIoC = (Component, select) => {
    let hoc = (props, context) => {
        let enhancedProps = Object.assign({}, props, select(context.gridHost || context));
        return <Component {...enhancedProps} />;
    };

    hoc.contextTypes = {
        gridHost: React.PropTypes.object.isRequired
    }

    return hoc;
};
