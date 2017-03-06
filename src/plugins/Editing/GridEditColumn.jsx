import React from 'react';

import { asPluginComponent } from '../pluggable';

export const GridDataCommandCellView = ({ row, column, onClick, commands }) => {
    return (
        <div key={column.field} className="grid-data-row-cell">
            {commands.map(command => <span key={command} className="edit-command" onClick={() => onClick({ row, command })}>{command}&nbsp;</span>)}
        </div>
    );
};

const tableColumnsSelector = (original, position) => {
    const commandColumn = { type: 'command' };
    if(position === 'left') {
        return [ commandColumn, ...original() ];
    }
    else {
        return [ ...original(), commandColumn ];
    }
};

const renderDataRowCommandCell = (cellContext, originalRender, { events }) => {
    let { commandColumnClick } = events;
    let { row, column } = cellContext;
    if(column.type === 'command') {
        return <GridDataCommandCellView {...cellContext} onClick={commandColumnClick} commands={['Edit']}/>
    }
    return originalRender(cellContext);
};

const commandColumnClick = (args, { actionCreators, dispatch }) => {
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
};

const editorValueChange = (args, { actionCreators, dispatch }) => {
    let { value, row, column } = args;
    let { cellValueChangeEdit } = actionCreators;
    dispatch(cellValueChangeEdit({ value, row, column }));
};

export const griEditColumnPlugin = ({ position }) => {
    return {
        selectors: {
            tableColumnsSelector: (original) => () => tableColumnsSelector(original, position)
        },
        events: {
            commandColumnClick: (original, host) => args => (original && original(args)) || commandColumnClick(args, host),
            editorValueChange: (original, host) => args => (original && original(args)) || editorValueChange(args, host),
        },
        components: {
            GridDataCommandCellView: () => GridDataCommandCellView,
            renderDataRowCell: (original, host) => cellContext => renderDataRowCommandCell(cellContext, original, host)
        }
    };
}

export default asPluginComponent(griEditColumnPlugin);