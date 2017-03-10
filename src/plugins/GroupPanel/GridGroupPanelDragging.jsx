import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const GridGroupPanelDropView = ({ draggingColumn, onGroupByColumn, children }) => {
    return (
        <div
            style={{ border: draggingColumn ? '1px dashed black' : null }}
            onDragOver={e => draggingColumn && e.preventDefault()}
            onDrop={e => {
                onGroupByColumn({ column: draggingColumn });
            }}>
            { children }
        </div>
    );
};

const GridGroupPanelDropContainer = connectIoC(
    connect(
        (state, props) => ({
            draggingColumn: state.draggingColumn
        }),
        (dispatch, props) => ({
            onGroupByColumn: args => {
                let { column } = args;
                dispatch(props.groupByColumn({ column }));
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
            GridGroupPanel: (original) => (props) => <GridGroupPanelDropContainer {...props}>{original(props)}</GridGroupPanelDropContainer>
        }
    };
});