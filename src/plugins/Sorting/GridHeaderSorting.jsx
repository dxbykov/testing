import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const GridHeaderCellWithSortingView = ({ column, sortDirection, onClick, children }) => (
    <div onClick={() => onClick({column})} style={{ width: '100%', height: '100%' }}>
        {children} { sortDirection ? (sortDirection === 'desc' ? '↑' : '↓') : '#'}
    </div>
)

const GridHeaderCellWithSortingContainer = connectIoC(
    connect(
        (state, props) => ({ 
            sortDirection: props.columnSortingsSelector(state).filter(s => s.column === props.column.field).map(s => s.direction)[0]
        }),
        (dispatch, props) => ({
            onClick: (id) => {
                let { sotrByColumn, column } = props;
                dispatch(sotrByColumn({ column }));
            }
        }))(GridHeaderCellWithSortingView),
    ioc => ({ 
        sotrByColumn: ioc.actionCreators.sotrByColumn,
        columnSortingsSelector: ioc.selectors.columnSortingsSelector
    })
);

const renderCellContent = ({ row, column }, original) => {
    if(row.type === 'header' && !column.type) {
        return <GridHeaderCellWithSortingContainer row={row} column={column}>{original({ row, column })}</GridHeaderCellWithSortingContainer>
    }
    return original({ row, column });
};

export default asPluginComponent(() => {
    return {
        components: {
            renderCellContent: (original, host) => ({ row, column }) => renderCellContent({ row, column }, original)
        }
    };
});