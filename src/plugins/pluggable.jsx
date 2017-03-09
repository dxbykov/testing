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

class IoCHOC extends React.Component {
    render() {
        let enhancedProps = Object.assign({}, this.props, this.props.select(this.context.gridHost));
        return <this.props.WrappedComponent {...enhancedProps} />;
    }
}

IoCHOC.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}


export const connectIoC = (WrappedComponent, select) => {
    let hoc = (props) => {
        return <IoCHOC {...props} select={select} WrappedComponent={WrappedComponent} />;
    };

    hoc.contextTypes = {
        gridHost: React.PropTypes.object.isRequired
    }

    return hoc;
};
