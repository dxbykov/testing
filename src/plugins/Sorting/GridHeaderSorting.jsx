import React from 'react';

import { asPluginComponent } from '../pluggable';

export const GridHeaderCellWithSortingView = ({ column, sortDirection, onClick }, { gridHost }) => {
    return (
        <th onClick={() => onClick({column})} className="grid-header-row-cell">
            {column.field} { sortDirection ? (sortDirection === 'desc' ? '↑' : '↓') : '#'}
        </th>
    );
};

export const GridHeaderCellWithSortingContainer = ({ column }, { gridHost }) => {
    let { headerCellSortClick } = gridHost.events;
    let { columnSortingsSelector } = gridHost.selectors;
    let sortDirection = columnSortingsSelector().filter(s => s.column === column.field).map(s => s.direction)[0];
    return (
        <GridHeaderCellWithSortingView onClick={headerCellSortClick} column={column} sortDirection={sortDirection} />
    );
};

GridHeaderCellWithSortingContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}

const headerCellSortClick = (args, { actionCreators, dispatch }) => {
    let { sotrByColumn } = actionCreators;
    let { column } = args;
    dispatch(sotrByColumn({ column }));
};

export const gridHeaderSortingPlugin = () => {
    return {
        events: {
            headerCellSortClick: (original, host) => args => (original && original(args)) || headerCellSortClick(args, host)
        },
        components: {
            GridHeaderCell: (original) => (props) => <GridHeaderCellWithSortingContainer {...props} original={original} />
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);