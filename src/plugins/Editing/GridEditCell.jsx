import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

export const GridEditCellView = ({ row, column, onValueChange }) => {
    return (
        <div key={column.field} className="grid-edit-row-cell">
            <input type="text" style={{width: '100%'}} value={row[column.field]} onChange={(args) => onValueChange({ value: args.target.value, row, column })} />
        </div>
    );
};

const mapDispatchToProps = (dispatch, props) => {
    let { actionCreators } = props;
    return {
        onValueChange: (args) => {
            let { value, row, column } = args;
            let { cellValueChangeEdit } = props;
            dispatch(cellValueChangeEdit({ value, row, column }));
        }
    }
}

const mapIocToProps = ioc => {
    return {
        cellValueChangeEdit: ioc.actionCreators.cellValueChangeEdit
    };
}

export default connectIoC(connect(state => ({}), mapDispatchToProps)(GridEditCellView), mapIocToProps);

