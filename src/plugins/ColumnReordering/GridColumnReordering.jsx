import React from 'react';

import { asPluginComponent } from '../pluggable';

export const GridHeaderCellWithDraggingView = ({ column, sortDirection, onClick, children }) => {
    return (
        <th 
            draggable={true}
            className="grid-header-row-cell"
            onDrag={(e) => e.dataTransfer.setData("columnFiekd", column.field)}>
            { children }
        </th>
    );
};

export const GridHeaderCellWithDraggingContainer = ({ column, original }, { gridHost }) => {
    let { columnSortingsSelector } = gridHost.selectors;
    let sortDirection = columnSortingsSelector().filter(s => s.column === column.field).map(s => s.direction)[0];
    return (
        <GridHeaderCellWithDraggingView onClick={columnOrderChange} column={column} sortDirection={sortDirection}>
            { original }
        </GridHeaderCellWithDraggingView>
    );
};

GridHeaderCellWithDraggingContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}

export const GridTableViewWithDraggingView = ({ columns, onColumnOrderChange, children }) => {
    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onColumnOrderChange({ column: columns[2].field, diff: +2 })}>
            { children }
        </div>
    );
};

export const GridTableViewWithDraggingContainer = ({ column, original }, { gridHost }) => {
    let { columnOrderChange } = gridHost.events;
    let { tableColumnsSelector } = gridHost.selectors;
    return (
        <GridTableViewWithDraggingView columns={tableColumnsSelector()} onColumnOrderChange={columnOrderChange}>
            { original }
        </GridTableViewWithDraggingView>
    );
};

GridTableViewWithDraggingContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}

const columnOrderChange = (args, { actionCreators, dispatch }) => {
    let { reorderColumn } = actionCreators;
    let { column, diff } = args;
    dispatch(reorderColumn({ column, diff }));
};

export const gridHeaderSortingPlugin = () => {
    return {
        events: {
            columnOrderChange: (original, host) => args => (original && original(args)) || columnOrderChange(args, host)
        },
        components: {
            GridHeaderCell: (original) => (props) => <GridHeaderCellWithDraggingContainer {...props} original={original(props)} />,
            GridTableView: (original) => (props) => <GridTableViewWithDraggingContainer {...props} original={original(props)} />
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);