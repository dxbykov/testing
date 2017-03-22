import React from 'react';
import { PluginHost as PluginHostCore } from '@devexpress/dx-core';
import { Template } from './template.jsx';
import { TemplatePlaceholder } from './template-placeholder.jsx';

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

        return (
            <div>
                <Template name="root" />
                {children}
                <TemplatePlaceholder name="root" />
            </div>
        )
    }
};
PluginHost.childContextTypes = {
    pluginHost: React.PropTypes.object.isRequired,
};