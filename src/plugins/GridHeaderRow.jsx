import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridHeaderCellView = ({ column }) => {
    return (
        <th className="grid-header-row-cell">{column}</th>
    );
};

export const GridHeaderRowView = ({ columns, CellComponent }) => {
    return (
        <tr className="grid-header-row">
            {columns.map((column, index) => <CellComponent key={index} column={column} />)}
        </tr>
    );
};

const renderRow = (rowContext, originalRender) => {
    let { row, components } = rowContext;
    if(row.type === 'header') {
        return <GridHeaderRowView {...rowContext} CellComponent={components.GridHeaderCell} />
    }
    return originalRender(rowContext);
};

export const gridHeaderRowPlugin = () => {
    return {
        components: {
            GridHeaderRow: original => GridHeaderRowView,
            GridHeaderCell: original => GridHeaderCellView,
            renderRow: original => rowContext => renderRow(rowContext, original)
        },
        selectors: {
            rowsSelector: (original, selectors) => () => [{ type: 'header' }, ...original(selectors)]
        }
    };
}

export default asPluginComponent(gridHeaderRowPlugin);