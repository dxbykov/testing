import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridHeaderCellView = ({ column }) => {
    return (
        <th className="grid-header-row-cell">{column}</th>
    );
};

export const GridHeaderRowView = ({ columns, cellComponent }) => {
    let Cell = cellComponent;
    return (
        <tr className="grid-header-row">
            {columns.map((column, index) => <Cell key={index} column={column} />)}
        </tr>
    );
};

export const GridHeaderRowContainer = ({ columns }, { gridHost }) => {
    let { GridHeaderCell } = gridHost.components;
    return (
        <GridHeaderRowView  columns={columns} cellComponent={GridHeaderCell} />
    );
};

GridHeaderRowContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

const renderRow = (rowContext, originalRender, host) => {
    let { row } = rowContext;
    let { components } = host;
    let { GridHeaderRow } = components;
    if(row.type === 'header') {
        return <GridHeaderRow {...rowContext} />
    }
    return originalRender(rowContext);
};

export const gridHeaderRowPlugin = () => {
    return {
        components: {
            GridHeaderRow: original => GridHeaderRowContainer,
            GridHeaderCell: original => GridHeaderCellView,
            renderRow: (original, host) => rowContext => renderRow(rowContext, original, host)
        },
        selectors: {
            tableRowsSelector: (original, host) => () => [{ type: 'header' }, ...original()]
        }
    };
}

export default asPluginComponent(gridHeaderRowPlugin);