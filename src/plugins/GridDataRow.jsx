import React from 'react';

export const GridDataRowView = ({ row, columns }) => {
    return (
        <tr className="grid-data-row">
            {columns.map((column, index) => <td key={index} className="grid-data-row-cell">{row[column]}</td>)}
        </tr>
    );
};

const renderRow = (rowContext, originalRender) => {
    let { row } = rowContext;
    if(!row.type) {
        return <GridDataRowView {...rowContext} />
    }
    return originalRender(rowContext);
};

const gridDataRowPlugin = {
    components: {
        GridDataRow: original => GridDataRowView,
        renderRow: original => rowContext => renderRow(rowContext, original)
    }
}

export default gridDataRowPlugin;