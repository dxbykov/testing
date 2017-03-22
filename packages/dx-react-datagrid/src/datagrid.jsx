import React from 'react';
import { PluginHost, Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';

export class DataGrid extends React.PureComponent {
    render() {
        let { rows, columns, children } = this.props;
        
        return (
            <PluginHost>
                <div id='plugins-root' style={{ display: 'none' }}>
                    <DataGridBase rows={rows} columns={columns} />
                    {children}
                </div>
                <TemplatePlaceholder name="root" />
            </PluginHost>
        )
    }
};
DataGrid.propTypes = {
    rows: React.PropTypes.array.isRequired,
    columns: React.PropTypes.array.isRequired,
};

class DataGridBase extends React.PureComponent {
    render() {
        let { rows, columns } = this.props;
        
        return (
            <div>
                <Template name="root" />
                <Getter name="rows" value={rows} />
                <Getter name="columns" value={columns} />
            </div>
        )
    }
}