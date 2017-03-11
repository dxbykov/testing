import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const GridEditCellView = ({ row, column, onValueChange }) => {
    return (
        <div key={column.field} className="grid-edit-row-cell">
            <input type="text" style={{width: '100%'}} value={row[column.field]} onChange={(args) => onValueChange({ value: args.target.value, row, column })} />
        </div>
    );
};

const GridEditCellContainer = connectIoC(
    connect(
        state => ({}),
        (dispatch, props) => ({
            onValueChange: (args) => {
                let { value, row, column } = args;
                let { cellValueChangeEdit } = props;
                dispatch(cellValueChangeEdit({ value, row, column }));
            }
        })
    )(GridEditCellView),
    ioc => ({
        cellValueChangeEdit: ioc.actionCreators.cellValueChangeEdit
    })
);

const GridDataCommandCellView = ({ row, column, onClick, commands }) => (
    <div key={column.field}>
        {commands.map(command => <span key={command} className="edit-command" onClick={() => onClick({ row, command })}>{command}&nbsp;</span>)}
    </div>
);

const GridDataCommandCellViewContainer = connectIoC(
    connect(
        (state, props) => ({
            commands: props.rowEditCommandsSelector(state, { rowId: props.row.id })
        }),
        (dispatch, props) => ({
            onClick: (args) => {
                let { actionCreators } = props;
                let { startRowEdit, saveRowChanges, cancelRowChanges } = actionCreators;
                let { row, command } = args;

                switch(command) {
                    case 'Edit':
                        dispatch(startRowEdit({ row }));
                    break;
                    case 'Save':
                        dispatch(saveRowChanges({ row }));
                    break;
                    case 'Cancel':
                        dispatch(cancelRowChanges({ row }));
                    break;
                }            
            }
        })
    )(GridDataCommandCellView), 
    ioc => ({
        rowEditCommandsSelector: ioc.selectors.rowEditCommandsSelector,
        actionCreators: ioc.actionCreators
    })
);


const enhanceTableColumnsSelector = (original, position) => state => {
    const commandColumn = { type: 'command' };
    if(position === 'left') {
        return [ commandColumn, ...original(state) ];
    }
    else {
        return [ ...original(state), commandColumn ];
    }
};

const renderCellContent = ({ row, column }, original) => {
    if(column.type === 'command' && !row.type) {
        return <GridDataCommandCellViewContainer row={row} column={column} commands={['Edit']}/>
    }
    if(!column.type && row.state === 'editing') {
        return <GridEditCellContainer row={row} column={column}/>
    }
    return original({ row, column });
};

export default asPluginComponent((propsSelector) => {
    return {
        selectors: {
            tableColumnsSelector: (original) => enhanceTableColumnsSelector(original, propsSelector().position)
        },
        components: {
            renderCellContent: (original, host) => ({ row, column }) => renderCellContent({ row, column }, original)
        }
    };
});