import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

export const GridDataCommandCellView = ({ row, column, onClick, commands }) => {
    return (
        <div key={column.field} className="grid-data-row-cell">
            {commands.map(command => <span key={command} className="edit-command" onClick={() => onClick({ row, command })}>{command}&nbsp;</span>)}
        </div>
    );
};

const mapStateToProps = (state, props) => {
    return {
    };
}
const mapDispatchToProps = (dispatch, props) => {
    let { actionCreators } = props;
    return {
        onClick: (args) => {
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
    }
}
let GridDataCommandCellViewContainer = connect(mapStateToProps, mapDispatchToProps)(GridDataCommandCellView);

const mapIocToProps = ioc => {
    return {
        actionCreators: ioc.actionCreators
    };
}
GridDataCommandCellViewContainer = connectIoC(GridDataCommandCellViewContainer, mapIocToProps);


const enhanceTableColumnsSelector = (original, position) => state => {
    const commandColumn = { type: 'command' };
    if(position === 'left') {
        return [ commandColumn, ...original(state) ];
    }
    else {
        return [ ...original(state), commandColumn ];
    }
};

const renderDataRowCommandCell = (cellContext, originalRender, host) => {
    let { row, column } = cellContext;
    let { GridDataCommandCell } = host.components;
    if(column.type === 'command') {
        return <GridDataCommandCell {...cellContext} commands={['Edit']}/>
    }
    return originalRender(cellContext);
};

export const griEditColumnPlugin = ({ position }) => {
    return {
        selectors: {
            tableColumnsSelector: (original) => enhanceTableColumnsSelector(original, position)
        },
        components: {
            GridDataCommandCell: () => GridDataCommandCellViewContainer,
            renderDataRowCell: (original, host) => cellContext => renderDataRowCommandCell(cellContext, original, host)
        }
    };
}

export default asPluginComponent(griEditColumnPlugin);