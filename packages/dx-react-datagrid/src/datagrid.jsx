import React from 'react';
import { PluginHost, Getter } from '@devexpress/dx-react-core';

export class DataGrid extends React.PureComponent {
  render() {
    const { rows, columns, children } = this.props;

    return (
      <PluginHost>
        <DataGridBase rows={rows} columns={columns} />
        {children}
      </PluginHost>
    );
  }
}
DataGrid.propTypes = {
  rows: React.PropTypes.array.isRequired,
  columns: React.PropTypes.array.isRequired,
};

class DataGridBase extends React.PureComponent {
  render() {
    const { rows, columns } = this.props;

    return (
      <div>
        <Getter name="rows" value={rows} />
        <Getter name="columns" value={columns} />
      </div>
    );
  }
}
