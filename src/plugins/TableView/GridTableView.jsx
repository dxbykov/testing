import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const GridTableViewView = ({ rows, columns, renderCellContent }) => {
    return (
        <table className="grid-table-view" style={{ borderCollapse: 'collapse' }}>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={row.id !== undefined && String(row.id) || row.type}>
                        {columns.map((column, columnIndex) => (
                            <td key={column.field || column.type}>{renderCellContent({ row, column })}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const GridTableView = connectIoC(
    connect(
        (state, props) => ({
            rows: props.tableRowsSelector(state),
            columns: props.tableColumnsSelector(state)
        })
    )(GridTableViewView),
    ioc => ({ 
        renderCellContent: ioc.components.renderCellContent,
        tableRowsSelector: ioc.selectors.tableRowsSelector,
        tableColumnsSelector: ioc.selectors.tableColumnsSelector
    })
)

export default asPluginComponent((config) => {
    let targetSlot = config.slot || 'bodySlot';

    let result = {
        selectors: {
            tableRowsSelector: (original, host) => state => host.selectors.rowsSelector(state),
            tableColumnsSelector: (original, host) => state => host.selectors.columnsSelector(state),
        },
        components: {
            renderCellContent: (original, host) => ({ row, column }) => row[column.field]
        },
        slots: {
            [targetSlot]: original => {
                let target = original || [];
                target.push(GridTableView);
                return target;
            }
        }
    };

    return result;
});
