import React from 'react'

export class Cell extends React.Component {
    render() {
        let { rowIndex, columnIndex, data } = this.props;
        let template = this.props.template || (({ rowIndex, columnIndex, data }) => data);

        return (
            <div style={{ padding: '10px', border: '1px dotted black' }}>
                {template({ rowIndex, columnIndex, data })}
            </div>
        );
    }
}
Cell.propTypes = {
    rowIndex: React.PropTypes.number.isRequired,
    columnIndex: React.PropTypes.number.isRequired,
    data: React.PropTypes.any.isRequired,
    template: React.PropTypes.func
};

export const cellProvider = () => {
    return {
        size: ({ column }) => column.width || 200,
        template: ({ rowIndex, columnIndex, data, template }) => (
            <Cell
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                data={data}
                template={template}/>
        )
    };
};

export class DetailCell extends React.Component {
    render() {
        let { rowIndex, columnIndex, data } = this.props;
        let template = this.props.template || (() => this.props.expanded ? '-' : '+');

        return (
            <div style={{ padding: '10px', border: '1px dotted black' }} onClick={() => this.props.expandedChange(!this.props.expanded)}>
                {template({ rowIndex, columnIndex, data })}
            </div>
        );
    }
}
DetailCell.propTypes = {
    rowIndex: React.PropTypes.number.isRequired,
    columnIndex: React.PropTypes.number.isRequired,
    template: React.PropTypes.func,
    expanded: React.PropTypes.bool.isRequired,
    expandedChange: React.PropTypes.func.isRequired,
};

export const detailCellProvider = ({ isExpanded, toggleExpanded }) => {
    return {
        size: ({ column }) => column.width || 40,
        template: ({ rowIndex, row, columnIndex, template }) => (
            <DetailCell
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                template={template}
                expanded={isExpanded({ rowIndex, row })}
                expandedChange={() => toggleExpanded({ rowIndex, row })}/>
        )
    };
};