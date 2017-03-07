import React from 'react';

import { asPluginComponent, connectIoC } from './pluggable';

export const GridTableViewView = ({ rows, columns, renderRow }) => {
    return (
        <table className="grid-table-view" style={{ borderCollapse: 'collapse' }}>
            <tbody>
                {rows.map((row, key) => renderRow({row, columns, key}))}
            </tbody>
        </table>
    );
};

const selectIocProps = ioc => {
  let { 
      components: { renderRow }, 
      selectors: { tableRowsSelector, tableColumnsSelector }
    } = ioc;

  return {
    renderRow,
    rows: tableRowsSelector(),
    columns: tableColumnsSelector()
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
