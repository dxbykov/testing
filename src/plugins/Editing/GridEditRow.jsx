import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';
import GridEditCellViewContainer from './GridEditCell';

export const GridEditRowView = ({ row, columns, components }) => {
    let { renderEditRowCell } = components;
    return (
        <tr className="grid-data-row">
            {columns.map((column, index) => <td key={index}>{renderEditRowCell({row, column})}</td>)}
        </tr>
    );
};

let GridEditRowContainer = connectIoC(GridEditRowView, ioc => ({ components: ioc.components }));

const renderRow = (rowContext, originalRender, host) => {
    let { GridEditRow } = host.components;
    let { row } = rowContext;
    if(row.type === 'editing') {
        return <GridEditRow {...rowContext} />
    }
    return originalRender(rowContext);
};

const renderEditRowCell = (cellContext, { components }) => {
    let { row, column } = cellContext;
    let { GridDataCommandCell } = components;
    if(column.type === 'command') {
        return <GridDataCommandCell key={column.field} {...cellContext} commands={['Save', 'Cancel']}/>
    }
    else if(!column.type) {
        return <GridEditCellViewContainer key={column.field} {...cellContext} />
    }
    return null;
};

let GridDataRowEnhanced = ({ ...props, OriginalRow }) => {
    return <OriginalRow {...props}  />;
};

let mapStateToProps = (state, props) => {
    let { editedCellsSelector } = props;
    let style = {};
    if(props.row.id in editedCellsSelector(state)) {
        style.fontWeight = 'bold';
    }
    return {
        style: style
    };
};

GridDataRowEnhanced = connect(mapStateToProps)(GridDataRowEnhanced);

let mapIocToProps = ioc => {
    return { editedCellsSelector: ioc.selectors.editedCellsSelector };
};

GridDataRowEnhanced = connectIoC(GridDataRowEnhanced, mapIocToProps)

export const gridEditRowPlugin = () => {
    return {
        components: {
            GridEditRow: original => GridEditRowContainer,
            GridDataRow: original => (props) => <GridDataRowEnhanced OriginalRow={original} {...props} />,
            renderRow: (original, host) => rowContext => renderRow(rowContext, original, host),
            renderEditRowCell: (original, host) => cellContext => renderEditRowCell(cellContext, host)
        }
    }
}

export default asPluginComponent(gridEditRowPlugin);