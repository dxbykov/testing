import React from 'react';

import { asPluginComponent, connectIoC } from '../pluggable';

export const GridEditCellView = ({ row, column, onValueChange }) => {
    return (
        <div key={column.field} className="grid-edit-row-cell">
            <input type="text" style={{width: '100%'}} value={row[column.field]} onChange={(args) => onValueChange(args.target.value)} />
        </div>
    );
};

export const GridEditRowView = ({ row, columns }, { gridHost: { components } }) => {
    let { renderEditRowCell } = components;
    return (
        <tr className="grid-data-row">
            {columns.map((column, index) => <td key={index}>{renderEditRowCell({row, column})}</td>)}
        </tr>
    );
};

GridEditRowView.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

const renderRow = (rowContext, originalRender) => {
    let { row } = rowContext;
    if(row.type === 'editing') {
        return <GridEditRowView {...rowContext} />
    }
    return originalRender(rowContext);
};

const renderEditRowCell = (cellContext, { components, events }) => {
    let { row, column } = cellContext;
    let { GridDataCommandCellView } = components;
    let { commandColumnClick, editorValueChange } = events;
    if(column.type === 'command') {
        return <GridDataCommandCellView key={column.field} {...cellContext} onClick={commandColumnClick} commands={['Save', 'Cancel']}/>
    }
    else if(!column.type) {
        return <GridEditCellView key={column.field} {...cellContext} onValueChange={(value) => editorValueChange({ value, row, column })} />
    }
    return null;
};

let GridDataRowEnhanced = ({ editedCellsSelector, ...props, OriginalRow}) => {
    let style = {};
    if(props.row.id in editedCellsSelector()) {
        style.fontWeight = 'bold';
    }
    return <OriginalRow {...props} style={style} />;
};

GridDataRowEnhanced = connectIoC(GridDataRowEnhanced, ioc => ({ editedCellsSelector: ioc.selectors.editedCellsSelector }))

export const gridEditRowPlugin = () => {
    return {
        components: {
            GridEditRow: original => GridEditRowView,
            GridDataRow: original => (props) => <GridDataRowEnhanced OriginalRow={original} {...props} />,
            renderRow: original => rowContext => renderRow(rowContext, original),
            renderEditRowCell: (original, host) => cellContext => renderEditRowCell(cellContext, host)
        }
    }
}

export default asPluginComponent(gridEditRowPlugin);