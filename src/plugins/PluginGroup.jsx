import React from 'react';

export default class PluginGroup extends React.PureComponent {
    render() {
        return <div style={{display: 'none'}}>{this.props.children}</div>;
    }
}