import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

class GridHeaderCellWithDraggingView extends React.PureComponent {
    componentWillUnmount() {
        let { onGeometryUpdate } = this.props;

        onGeometryUpdate({ left: 0, width: 0 });
    }
    render() {
        let { column, onDragStart, onDragEnd, children } = this.props;

        return (
            <th 
                ref={ref => {
                    if(!ref) return;

                    this.root = ref;

                    let { onGeometryUpdate } = this.props;
                    let { left, width } = this.root.getBoundingClientRect();

                    if(left !== this.left || width !== this.width) {
                        this.left = left;
                        this.width = width;
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
    }
}

const GridHeaderCellWithDraggingContainer = connectIoC(
    connect(
        (state, props) => ({}),
        (dispatch, props) => ({
            onDragStart: args => {
                let { column } = props;
                dispatch(props.dragStart({ data: { type: 'column', columnName: column.field } }));
            },
            onDragEnd: args => {
                dispatch(props.dragEnd());
            },
            onGeometryUpdate: args => {
                let { left, width } = args;
                let { column } = props;
                dispatch(props.columnGeometryUpdate({ column: column.field, left, width }));
            }
        })
    )(GridHeaderCellWithDraggingView), 
    ioc => ({
        dragStart: ioc.actionCreators.dragStart,
        dragEnd: ioc.actionCreators.dragEnd,
        columnGeometryUpdate: ioc.actionCreators.columnGeometryUpdate
    })
);

const GridTableViewWithDraggingView = ({ draggingColumn, columnGeometries, columns, onColumnOrderChange, children }) => {
    return (
        <div
            onDragOver={e => {
                draggingColumn && e.preventDefault()
                let destination = columnGeometries.find(g => g.left <= e.pageX && g.left + g.width >= e.pageX);
                if(!destination) return;
                onColumnOrderChange({ column: draggingColumn, destination: destination.column, columns })
            }}>
            { children }
        </div>
    );
};

const GridTableViewWithDraggingContainer = connectIoC(
    connect(
        (state, props) => ({
            columns: props.columnsSelector(state),
            columnGeometries: state.columnGeometries,
            draggingColumn: state.draggingObject && state.draggingObject.type === 'column' && state.draggingObject.columnName
        }),
        (dispatch, props) => ({
            onColumnOrderChange: args => {
                let { column, destination, columns } = args;
                dispatch(props.reorderColumn({ column, destination, columns }));
            }
        })
    )(GridTableViewWithDraggingView), 
    ioc => ({
        columnsSelector: ioc.selectors.columnsSelector,
        reorderColumn: ioc.actionCreators.reorderColumn
    })
);

export default asPluginComponent(() => {
    return {
        components: {
            GridHeaderCell: (original) => (props) => <GridHeaderCellWithDraggingContainer {...props}>{original(props)}</GridHeaderCellWithDraggingContainer>,
            GridTableView: (original) => (props) => <GridTableViewWithDraggingContainer {...props}>{original(props)}</GridTableViewWithDraggingContainer>
        }
    };
});