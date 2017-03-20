import React from 'react';
import { PluginHost as PluginHostCore } from '@devexpress/dx-core'

export class PluginsHost extends React.PureComponent {
    constructor(props) {
        super(props);

        this.host = new PluginHostCore();
    }
    getChildContext() {
        return {
            pluginsHost: this.host
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
PluginsHost.childContextTypes = {
    pluginsHost: React.PropTypes.object.isRequired,
};