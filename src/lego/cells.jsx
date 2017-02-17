import React from 'react'

export class Cell extends React.Component {
    render() {
        let { children, ...other } = this.props;

        return (
            <div
                style={{ 
                    padding: '10px',
                    borderBottom: '1px dotted black',
                    borderRight: '1px dotted black'
                }} {...other}>
                {children}
            </div>
        );
    }
}

export const cellProvider = ({ predicate, template } = {}) => {
    return {
        predicate: predicate || (() => true),
        size: ({ column }) => column.width || 200,
        template: template || (({ data }) => (
            <Cell>{data}</Cell>
        ))
    };
};

export class SortableCell extends React.Component {
    render() {
        let { direction, directionChange, children } = this.props;

        return (
            <Cell onClick={directionChange}>
                { children } [{ direction ? (direction === 'desc' ? 'U' : 'D') : '#'}]
            </Cell>
        );
    }
}
SortableCell.propTypes = {
    direction: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.bool]).isRequired,
    directionChange: React.PropTypes.func.isRequired,
};

export class DetailCell extends React.Component {
    render() {
        return (
            <div 
                style={{ 
                    padding: '10px',
                    borderBottom: '1px dotted black',
                    borderRight: '1px dotted black'
                }} 
                onClick={() => this.props.expandedChange(!this.props.expanded)}>
                {this.props.expanded ? '-' : '+'}
            </div>
        );
    }
}
DetailCell.propTypes = {
    expanded: React.PropTypes.bool.isRequired,
    expandedChange: React.PropTypes.func.isRequired,
};

export const detailCellProvider = ({ isExpanded, toggleExpanded }) => {
    return {
        predicate: ({ column }) => column.type === 'detail',
        size: ({ column }) => column.width || 40,
        template: ({ rowIndex, row, columnIndex }) => (
            <DetailCell
                expanded={isExpanded({ rowIndex, row })}
                expandedChange={() => toggleExpanded({ rowIndex, row })}/>
        )
    };
};