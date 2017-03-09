import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

export const GridHeaderCellWithSortingView = ({ column, sortDirection, onClick }) => {
    return (
        <th onClick={() => onClick({column})} className="grid-header-row-cell">
            {column.field} { sortDirection ? (sortDirection === 'desc' ? '↑' : '↓') : '#'}
        </th>
    );
};

const mapStateToProps = (state, props) => {
    let { columnSortingsSelector, column } = props;
    return {
        sortDirection: columnSortingsSelector(state).filter(s => s.column === column.field).map(s => s.direction)[0]
    };
}
const mapDispatchToProps = (dispatch, props) => {
    let  { sotrByColumn, column } = props;
    return {
        onClick: (id) => {
            dispatch(sotrByColumn({ column }));
        }
    }
}
let GridHeaderCellWithSortingContainer = connect(mapStateToProps, mapDispatchToProps)(GridHeaderCellWithSortingView);

const mapIocToProps = ioc => {
    let { sotrByColumn } = ioc.actionCreators;
    let { columnSortingsSelector } = ioc.selectors;
    return {
        sotrByColumn,
        columnSortingsSelector
    };
}
GridHeaderCellWithSortingContainer = connectIoC(GridHeaderCellWithSortingContainer, mapIocToProps);

export const gridHeaderSortingPlugin = () => {
    return {
        components: {
            GridHeaderCell: (original) => (props) => <GridHeaderCellWithSortingContainer {...props} original={original} />
        }
    };
}

export default asPluginComponent(gridHeaderSortingPlugin);