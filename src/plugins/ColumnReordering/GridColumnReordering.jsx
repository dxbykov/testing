import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

export const GridHeaderCellWithDraggingView = ({ geometry, onDragStart, onDragEnd, onGeometryUpdate, children }) => {
    return (
        <th 
            ref={ref => {
                if(!ref) return;

                let { left, width } = ref.getBoundingClientRect();
                if(geometry.left !== left || geometry.width !== width) {
                    onGeometryUpdate({ left, width });
                }
            }}
            draggable={true}
            className="grid-header-row-cell"
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}>
            { children }
        </th>
    );
};

const geometryFor = (columnName, geometries) => {
    if(!geometries.length)
        return { left: 0, width: 0 };
    let geometry = geometries.filter(s => s.column === columnName)[0];
    return geometry ? { left: geometry.left, width: geometry.width } : { left: 0, width: 0 };
};

export const GridHeaderCellWithDraggingContainer = connectIoC(
    connect(
        (state, props) => ({
            geometry: geometryFor(props.column.field, state.columnGeometries)
        }),
        (dispatch, props) => ({
            onDragStart: args => {
                let { column } = props;
                dispatch(props.columnDragStart({ column }));
            },
            onDragEnd: args => {
                dispatch(props.columnDragEnd());
            },
            onGeometryUpdate: args => {
                let { left, width } = args;
                let { column } = props;
                dispatch(props.columnGeometryUpdate({ column: column.field, left, width }));
            }
        })
    )(GridHeaderCellWithDraggingView), 
    ioc => ({
        columnDragStart: ioc.actionCreators.columnDragStart,
        columnDragEnd: ioc.actionCreators.columnDragEnd,
        columnGeometryUpdate: ioc.actionCreators.columnGeometryUpdate
    })
);

export const GridTableViewWithDraggingView = ({ draggingColumn, columnGeometries, columns, onColumnOrderChange, children }) => {
    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
                let destinationName = columnGeometries.find(g => g.left <= e.pageX && g.left + g.width >= e.pageX).column;
                if(!destinationName) return;
                let start = columns.findIndex(c => c.field === draggingColumn);
                let end = columns.findIndex(c => c.field === destinationName);
                onColumnOrderChange({ column: draggingColumn, diff: end - start, columns })
            }}>
            { children }
        </div>
    );
};

export const GridTableViewWithDraggingContainer = connectIoC(
    connect(
        (state, props) => ({
            columns: props.tableColumnsSelector(state),
            columnGeometries: state.columnGeometries,
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