import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const GridGroupDraggableItemView = ({ onDragStart, onDragEnd, children }) => {
    return (
        <span
            draggable={true}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}>
            { children }
        </span>
    );
};

const GridGroupDraggableItemContainer = connectIoC(
    connect(
        (state, props) => ({
            draggingColumn: state.draggingObject && state.draggingObject.type === 'column' && state.draggingObject.columnName
        }),
        (dispatch, props) => ({
            onDragStart: args => {
                let { group } = props;
                dispatch(props.dragStart({ data: { type: 'column', columnName: group.field } }));
            },
            onDragEnd: args => {
                dispatch(props.dragEnd());
            }
        })
    )(GridGroupDraggableItemView), 
    ioc => ({
        dragStart: ioc.actionCreators.dragStart,
        dragEnd: ioc.actionCreators.dragEnd,
    })
);

const GridGroupPanelDropView = ({ draggingColumn, onGroupByColumn, onUngroupByColumn, children }) => {
    return (
        <div
            style={{ border: draggingColumn ? '1px dashed black' : null }}
            onDragOver={e => {
                draggingColumn && e.preventDefault()
                onGroupByColumn({ column: draggingColumn });
            }}
            onDragLeave={e => {
                onUngroupByColumn({ column: draggingColumn });
            }}>
            { children }
        </div>
    );
};

const GridGroupPanelDropContainer = connectIoC(
    connect(
        (state, props) => ({
            draggingColumn: state.draggingObject && state.draggingObject.type === 'column' && state.draggingObject.columnName
        }),
        (dispatch, props) => ({
            onGroupByColumn: args => {
                let { column } = args;
                dispatch(props.groupByColumn({ column }));
            },
            onUngroupByColumn: args => {
                let { column } = args;
                dispatch(props.ungroupByColumn({ column }));
            }
        })
    )(GridGroupPanelDropView), 
    ioc => ({
        groupByColumn: ioc.actionCreators.groupByColumn,
        ungroupByColumn: ioc.actionCreators.ungroupByColumn
    })
);

export default asPluginComponent(() => {
    return {
        components: {
            GridGroupItem: (original) => (props) => <GridGroupDraggableItemContainer {...props}>{original(props)}</GridGroupDraggableItemContainer>,
            GridGroupPanel: (original) => (props) => <GridGroupPanelDropContainer {...props}>{original(props)}</GridGroupPanelDropContainer>
        }
    };
});