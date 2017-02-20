import React from 'react'

export class Cell extends React.Component {
    render() {
        let { children, style, ...other } = this.props;

        return (
            <div
                style={{ 
                    padding: '10px',
                    borderBottom: '1px dotted black',
                    borderRight: '1px dotted black',
                    ...style
                }}
                {...other}>
                {children}
            </div>
        );
    }
}

export const cellProvider = ({ stick, predicate, template } = {}) => {
    return {
        predicate: predicate || (() => true),
        stick: stick || (() => false),
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
                { children } [{ direction ? (direction === 'desc' ? '↑' : '↓') : '#'}]
            </Cell>
        );
    }
}
SortableCell.propTypes = {
    direction: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.bool]).isRequired,
    directionChange: React.PropTypes.func.isRequired,
};

export class SelectableCell extends React.Component {
    render() {
        let { selected, indeterminate, selectedChange, style } = this.props;

        return (
            <Cell style={{
                background: 'white',
                display: 'flex',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 0,
                ...style
            }}>
                <input
                    type='checkbox'
                    checked={selected}
                    ref={(ref) => { ref && (ref.indeterminate = indeterminate)}}
                    onClick={selectedChange}
                    style={{ margin: '0' }}/>
            </Cell>
        );
    }
}
SelectableCell.propTypes = {
    selected: React.PropTypes.bool.isRequired,
    indeterminate: React.PropTypes.bool,
    selectedChange: React.PropTypes.func.isRequired,
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