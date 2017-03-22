import React from 'react';
import { PluginHost as PluginHostCore } from '@devexpress/dx-core'

export class PluginHost extends React.PureComponent {
    constructor(props) {
        super(props);

        this.host = new PluginHostCore();
    }
    getChildContext() {
        return {
            pluginHost: this.host
        }
    }
    render() {
        let { children } = this.props;

        // TODO: Fiber: remove wrapper
        return (
            <div>
                {children}
            </div>
        )
    }
};
PluginHost.childContextTypes = {
    pluginHost: React.PropTypes.object.isRequired,
};