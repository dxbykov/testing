import React from 'react';

export const GridHeaderRowView = ({ columns }) => {
    return (
        <tr className="grid-header-row">
            {columns.map((column, index) => <th key={index} className="grid-header-row-cell">{column}</th>)}
        </tr>
    );
};

const renderRow = (rowContext, originalRender) => {
    let { row } = rowContext;
    if(row.type === 'header') {
        return <GridHeaderRowView {...rowContext} />
    }
    return originalRender(rowContext);
};

const gridHeaderRowPlugin = {
    components: {
        GridHeaderRow: original => GridHeaderRowView,
        renderRow: original => rowContext => renderRow(rowContext, original)
    },
    selectors: {
        rowsSelector: original => (state, props, selectors) => [{ type: 'header' }, ...original(state, props, selectors)]
    }
}

export default gridHeaderRowPlugin;