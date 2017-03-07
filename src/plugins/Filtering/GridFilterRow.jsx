import React from 'react';

import { asPluginComponent } from '../pluggable';

const filterFor = (columnName, filters) => {
    if(!filters.length)
        return '';
    let filter = filters.filter(s => s.column === columnName)[0];
    return filter ? filter.value : '';
};

export const GridFilterCellView = ({ column }, { gridHost }) => {
    let { filterChange } = gridHost.events;
    let { columnFiltersSelector } = gridHost.selectors;
    return (
        <th className="grid-filter-row-cell">
            <input
                type="text"
                value={filterFor(column.field, columnFiltersSelector())}
                onChange={(e) => filterChange({ column, value: e.target.value })}
                style={{ width: '100%' }}/>
        </th>
    );
};

GridFilterCellView.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}

export const GridFilterRowView = ({ columns, cellComponent }) => {
    let Cell = cellComponent;
    return (
        <tr className="grid-filter-row">
            {columns.map((column, index) => <Cell key={index} column={column} />)}
        </tr>
    );
};

export const GridFilterRowContainer = ({ columns }, { gridHost }) => {
    let { GridFilterCell } = gridHost.components;
    return (
        <GridFilterRowView columns={columns} cellComponent={GridFilterCell} />
    );
};

GridFilterRowContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}

const filterChange = (args, { actionCreators, dispatch }) => {
    let { filterColumn } = actionCreators;
    let { column, value } = args;
    dispatch(filterColumn({ column, value }));
};

const renderRow = (rowContext, originalRender, host) => {
    let { row } = rowContext;
    let { components } = host;
    let { GridFilterRow } = components;
    if(row.type === 'filter') {
        return <GridFilterRow {...rowContext} />
    }
    return originalRender(rowContext);
};

export const gridHeaderSortingPlugin = () => {
    return {
        events: {
            filterChange: (original, host) => args => (original && original(args)) || filterChange(args, host)
        },
        components: {
            GridFilterRow: original => GridFilterRowContainer,
            GridFilterCell: original => GridFilterCellView,
            renderRow: (original, host) => rowContext => renderRow(rowContext, original, host)
        },
        selectors: {
            tableRowsSelector: (original, host) => () => [original()[0], { type: 'filter' }, ...original().slice(1)]
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);