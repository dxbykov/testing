import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridDataCellView = ({ row, column }) => {
    return (
        <div className="grid-data-row-cell">{row[column.field]}</div>
    );
};

export const GridDataRowView = ({ row, columns, style }, { gridHost: { components } }) => {
    let { renderDataRowCell } = components;
    return (
        <tr className="grid-data-row" style={style}>
            {columns.map((column, index) => <td key={index}>{renderDataRowCell({row, column})}</td>)}
        </tr>
    );
};

GridDataRowView.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

const renderRow = (rowContext, originalRender, { components }) => {
    let { row } = rowContext;
    let { GridDataRow } = components;
    //if(!row.type) {
        return <GridDataRow {...rowContext} />
    // }
    // return originalRender(rowContext);
};

const renderDataRowCell = (cellContext, originalRender) => {
    let { row, column } = cellContext;
    //if(!row.type) {
        return <GridDataCellView {...cellContext} />
    // }
    // return originalRender(cellContext);
};

export const gridDataRowPlugin = () => {
    return {
        components: {
            GridDataRow: original => GridDataRowView,
            renderRow: (original, host) => rowContext => renderRow(rowContext, original, host),
            renderDataRowCell: original => cellContext => renderDataRowCell(cellContext, original)
        }
    }
}

export default asPluginComponent(gridDataRowPlugin);