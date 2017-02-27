import React from 'react'

import ReactHammer from 'react-hammerjs';
import Hammer from 'hammerjs';
import { gestureCover, clearSelection, clamp } from './utils'

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

export const cellProvider = ({ stick, predicate, template, preserve } = {}) => {
    return {
        predicate: predicate || (() => true),
        stick: stick || (() => false),
        size: ({ column }) => column.width || 200,
        preserve: preserve || (() => false),
        template: template || (({ data }) => (
            <Cell>{data}</Cell>
        ))
    };
};

export class SortableCell extends React.Component {
    render() {
        let { direction, directionChange, children, style } = this.props;

        return (
            <Cell onClick={directionChange} style={style}>
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

export class ResizableCell extends React.Component {
    render() {
        let { minWidth, maxWidth, onResize } = this.props;

        let root;
        let handlePanStart = (e) => {
            e.preventDefault();
            this.startWidth = root.getBoundingClientRect().width;
            clearSelection();
            gestureCover(true, 'col-resize');
        };
        let handlePanMove = (e) => {
            e.preventDefault();
            clearSelection();
            onResize(clamp(this.startWidth + e.deltaX, minWidth || 0, maxWidth || Number.POSITIVE_INFINITY));
        };
        let handlePanEnd = (e) => {
            e.preventDefault();
            gestureCover(false, 'col-resize');
        };

        return (
            <div 
                ref={ref => root = ref}
                style={{
                    height: '100%',
                    borderRight: '1px dotted black',
                }}>
                <div
                    style={{
                        width: 'calc(100% - 4px)',
                        float: 'left',
                        height: '100%',
                    }}>
                    {this.props.children}
                </div>
                <ReactHammer
                    onPanStart={handlePanStart}
                    onPan={handlePanMove}
                    onPanEnd={handlePanEnd}
                    options={{ direction: Hammer.DIRECTION_HORIZONTAL }}>
                    <div
                        style={{
                            width: '4px',
                            height: '100%',
                            float: 'right',
                            cursor: 'col-resize',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                        }}/>
                </ReactHammer>
            </div>
        )
    }
}
ResizableCell.propTypes = {
    onResize: React.PropTypes.func.isRequired,
};

export class DraggableCell extends React.Component {
    render() {
        let { onMove } = this.props;

        let root;
        let handlePanStart = (e) => {
            this.startWidth = root.getBoundingClientRect().width;
            clearSelection();
            gestureCover(true, 'move');
        };
        let handlePanMove = (e) => {
            clearSelection();
        };
        let handlePanEnd = (e) => {
            gestureCover(false, 'move');
            onMove(e.deltaX / Math.abs(e.deltaX));
        };

        return (
            <ReactHammer
                onPanStart={handlePanStart}
                onPan={handlePanMove}
                onPanEnd={handlePanEnd}
                options={{ direction: Hammer.DIRECTION_HORIZONTAL }}>
                <div
                    ref={ref => root = ref}
                    style={{
                        height: '100%',
                        cursor: 'move',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        borderRight: '1px dotted black',
                    }}>
                    {this.props.children}
                </div>
            </ReactHammer>
        )
    }
}
DraggableCell.propTypes = {
    onMove: React.PropTypes.func.isRequired,
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