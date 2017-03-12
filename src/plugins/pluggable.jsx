import React from 'react';

const addPluginToHost = (plugin, host) => {
    let exports = plugin.exports || plugin;

    Object.keys(exports).forEach(extensionType => {
        if(!host[extensionType]) {
            host[extensionType] = {};
        }
        
        Object.keys(exports[extensionType]).forEach(key => {
            let original = host[extensionType][key],
                enhancer = exports[extensionType][key];

            host[extensionType][key] = enhancer(original, host);
        });
    });
};

const filterObjectByObject = (source, filter) => {
    if(typeof filter === 'function') {//TODO add type check in development env
        return source;
    }

    let result = {};

    Object.keys(filter).forEach(key => {
        result[key] = filterObjectByObject(source[key], filter[key]);
    });

    return result;
};

export const asPluginComponent = pluginCtor => React.createClass({
    contextTypes: {
        gridHost: React.PropTypes.object.isRequired
    },
    getImports: function() {
        if(!this.imports) {
            throw new Error('Unable to access plugin imports during the initialization stage');
        }
        return this.imports;
    },
    initImports: function(imports) {
        const { gridHost } = this.context;
        //TODO dev mode: return undefined if imports are not specified (to reduce bugs)
        //TODO prod mode: return gridHost if imports are not specified (to increase performance)
        this.imports = imports ? filterObjectByObject(gridHost, imports) : gridHost;
    },
    componentWillMount: function() {
        const { gridHost } = this.context;
        let plugin = pluginCtor(() => this.props, gridHost, () => this.getImports());
        addPluginToHost(plugin, gridHost);
        this.initImports(plugin.imports);
    },
    componentWillReceiveProps: function(nextProps) {
        const { gridHost } = this.context;
        if(gridHost) {
            gridHost.forcePluginsUpdate();
        }
    },
    render: function() {
        return null;
    }
})

class IoCHOC extends React.PureComponent {
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

export const createReducer = (initialState, handlers) => {
  return (state = initialState, action) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
};
