import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from './pluggable';

export const GridTableViewView = ({ rows, columns, renderRow }) => {
    return (
        <table className="grid-table-view">
            <tbody>
                {rows.map((row, key) => renderRow({row, columns, key}))}
            </tbody>
        </table>
    );
};

const mapStateToProps = (state, props) => {
  let { tableRowsSelector, tableColumnsSelector } = props.selectors;
  return {
    rows: tableRowsSelector(state),
    columns: tableColumnsSelector(state)
  };
}
let GridTableView = connect(mapStateToProps)(GridTableViewView);

const mapIocToProps = ioc => {
  let { 
      components: { renderRow }, 
      selectors
    } = ioc;

  return {
    renderRow,
    selectors
  };
}
GridTableView = connectIoC(GridTableView, mapIocToProps);

export const gridTableViewPlugin = (config) => {
    let targetSlot = config.slot || 'bodySlot';

    let result = {
        selectors: {
            tableRowsSelector: (original, host) => state => host.selectors.rowsSelector(state),
            tableColumnsSelector: (original, host) => state => host.selectors.columnsSelector(state),
        },
        components: {
            renderRow: (original, host) => (rowContext) => original && original(rowContext) || null
        },
        slots: {
            [targetSlot]: original => {
                let target = original || [];
                target.push(GridTableView);
                return target;
            }
        }
    };

    return result;
}

export default asPluginComponent(gridTableViewPlugin);
