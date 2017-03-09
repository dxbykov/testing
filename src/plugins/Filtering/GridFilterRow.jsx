import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const filterFor = (columnName, filters) => {
    if(!filters.length)
        return '';
    let filter = filters.filter(s => s.column === columnName)[0];
    return filter ? filter.value : '';
};

export const GridFilterCellView = ({ column, filterChange, filters }) => {
    return (
        <th className="grid-filter-row-cell">
            <input
                type="text"
                value={filterFor(column.field, filters)}
                onChange={(e) => filterChange({ column, value: e.target.value })}
                style={{ width: '100%' }}/>
        </th>
    );
};

let GridFilterCellContainer = connectIoC(
    connect(
        (state, props) => ({
            filters: state.columnFilters
        }),
        (dispatch, props) => ({
            filterChange: args => {
                let { filterColumn } = props;
                let { column, value } = args;
                dispatch(filterColumn({ column, value }));
            }
        })
    )(GridFilterCellView),
    ioc => ({
        filterColumn: ioc.actionCreators.filterColumn,
        columnFiltersSelector: ioc.selectors.columnFiltersSelector
    })
);

export const GridFilterRowView = ({ columns, cellComponent }) => {
    let Cell = cellComponent;
    return (
        <tr className="grid-filter-row">
            {columns.map((column, index) => <Cell key={index} column={column} />)}
        </tr>
    );
};

let GridFilterRowContainer = connectIoC(
    GridFilterRowView,
    ioc => ({
        cellComponent: ioc.components.GridFilterCell
    })
);

const renderRow = (rowContext, originalRender, host) => {
    let { row } = rowContext;
    let { components } = host;
    let { GridFilterRow } = components;
    if(row.type === 'filter') {
        return <GridFilterRow {...rowContext} />
    }
    return originalRender(rowContext);
};

export const gridHeaderSortingPlugin = () => {
    return {
        components: {
            GridFilterRow: original => GridFilterRowContainer,
            GridFilterCell: original => GridFilterCellContainer,
            renderRow: (original, host) => rowContext => renderRow(rowContext, original, host)
        },
        selectors: {
            tableRowsSelector: (original, host) => state => [original(state)[0], { type: 'filter' }, ...original(state).slice(1)]
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);