import React from 'react';

import { asPluginComponent, connectIoC } from './pluggable';

export const GridTableViewView = ({ rows, columns, renderRow, registerRef }) => {
    return (
        <table
            ref={registerRef}
            className="grid-table-view"
            style={{ borderCollapse: 'collapse' }}>
            <tbody>
                {rows.map((row, key) => renderRow({row, columns, key}))}
            </tbody>
        </table>
    );
};

const selectIocProps = ioc => {
  let { 
      components: { renderRow }, 
      selectors: { tableRowsSelector, tableColumnsSelector },
      refs
    } = ioc;

  return {
    renderRow,
    rows: tableRowsSelector(),
    columns: tableColumnsSelector(),
    registerRef: (ref) => refs.gridTableView = ref
  };
}

let GridTableView = connectIoC(GridTableViewView, selectIocProps);

export const gridTableViewPlugin = (config) => {
    let targetSlot = config.slot || 'bodySlot';

    let result = {
        selectors: {
            tableRowsSelector: (original, host) => () => host.selectors.rowsSelector(),
            tableColumnsSelector: (original, host) => () => host.selectors.columnsSelector(),
        },
        components: {
            renderRow: (original, host) => (rowContext) => original && original(rowContext) || null,
            GridTableView: (original) => () => <GridTableView />
        },
        slots: {
            [targetSlot]: (original, host) => () => {
                let target = original() || [];
                let view = host.components.GridTableView;
                target.push(view);
                return target;
            }
        },
        refs: {},
        helpers: {
            columnIndexAt: (original, host) => ({ x }) => {
                // NOTE: DOM access should be changed to smth else
                
                let a = host.refs.gridTableView
                debugger;
            }
        }
    };

    return result;
}

export default asPluginComponent(gridTableViewPlugin);
