import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridDataCellView = ({ row, column }) => {
    return (
        <td key={column.field} className="grid-data-row-cell">{row[column.field]}</td>
    );
};

export const GridDataRowView = ({ row, columns }, { gridHost: { components } }) => {
    let { renderDataRowCell } = components;
    return (
        <tr className="grid-data-row">
            {columns.map((column, index) => renderDataRowCell({row, column}))}
        </tr>
    );
};

GridDataRowView.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

const renderRow = (rowContext, originalRender) => {
    let { row } = rowContext;
    if(!row.type) {
        return <GridDataRowView {...rowContext} />
    }
    return originalRender(rowContext);
};

const renderDataRowCell = (cellContext, originalRender) => {
    let { row, column } = cellContext;
    if(!row.type) {
        return <GridDataCellView {...cellContext} />
    }
    return originalRender(cellContext);
};

export const gridDataRowPlugin = () => {
    return {
        components: {
            GridDataRow: original => GridDataRowView,
            renderRow: original => rowContext => renderRow(rowContext, original),
            renderDataRowCell: original => cellContext => renderDataRowCell(cellContext, original)
        }
    }
}

export default asPluginComponent(gridDataRowPlugin);