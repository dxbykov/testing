import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

export const GridHeaderCellWithDraggingView = ({ onDragStart, onDragEnd, children }) => {
    return (
        <th 
            draggable={true}
            className="grid-header-row-cell"
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}>
            { children }
        </th>
    );
};

export const GridHeaderCellWithDraggingContainer = connectIoC(
    connect(
        (state, props) => ({}),
        (dispatch, props) => ({
            onDragStart: args => {
                let { column } = props;
                dispatch(props.columnDragStart({ column }));
            },
            onDragEnd: args => {
                dispatch(props.columnDragEnd());
            }
        })
    )(GridHeaderCellWithDraggingView), 
    ioc => ({
        columnDragStart: ioc.actionCreators.columnDragStart,
        columnDragEnd: ioc.actionCreators.columnDragEnd
    })
);

export const GridTableViewWithDraggingView = ({ draggingColumn, columns, onColumnOrderChange, children }) => {
    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onColumnOrderChange({ column: draggingColumn, diff: +2, columns })}>
            { children }
        </div>
    );
};

export const GridTableViewWithDraggingContainer = connectIoC(
    connect(
        (state, props) => ({
            columns: props.tableColumnsSelector(state),
            draggingColumn: state.draggingColumn
        }),
        (dispatch, props) => ({
            onColumnOrderChange: args => {
                let { column, diff, columns } = args;
                dispatch(props.reorderColumn({ column, diff, columns }));
            }
        })
    )(GridTableViewWithDraggingView), 
    ioc => ({
        tableColumnsSelector: ioc.selectors.tableColumnsSelector,
        reorderColumn: ioc.actionCreators.reorderColumn
    })
);

export const gridHeaderSortingPlugin = () => {
    return {
        components: {
            GridHeaderCell: (original) => (props) => <GridHeaderCellWithDraggingContainer {...props}>{original(props)}</GridHeaderCellWithDraggingContainer>,
            GridTableView: (original) => (props) => <GridTableViewWithDraggingContainer {...props}>{original(props)}</GridTableViewWithDraggingContainer>
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);