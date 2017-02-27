import React from 'react';

import { VirtualBox, stickyProp } from './components';
import { Cells, Rows, rowProviderFor } from './grid';
import { Transition } from './animation';


export const rowProvider = () => {
    return {
        predicate: () => true,
        size: () => 40,
        template: ({ rowIndex, row, columns }) => (
            <Cells
                columns={columns}
                rowIndex={rowIndex}
                row={row}/>
        )
    };
};


export const headingRowProvider = () => {
    return {
        predicate: ({ row }) => row.type === 'heading',
        stick: () => 'before',
        size: () => 40,
        template: ({ rowIndex, row, columns }) => (
            <Cells
                columns={columns}
                rowIndex={rowIndex}
                row={row}
                style={{ 
                    background: 'white',
                    borderBottom: '2px solid black'
                }}/>
        )
    };
};

export class DetailRow extends React.Component {
    render() {
        let rowTemplate = (
            <Cells
                columns={this.props.columns}
                rowIndex={this.props.rowIndex}
                row={this.props.row}/>
        );
        let detailTemplate = (this.props.expanded || this.props.detailStyles.height !== 0) && (
            <div style={{ width: '100%', borderBottom: '1px dashed black', ...this.props.detailStyles }}>
                This is detail view
            </div>
        );

        return (
            <div>
                <div style={{ height: 40 + 'px' }}>
                    {rowTemplate}
                </div>
                {detailTemplate}
            </div>
        );
    }
}
DetailRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    row: React.PropTypes.any.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    detailStyles: React.PropTypes.object.isRequired
};
DetailRow.defaultProps = {
  detailStyles: { height: 40 }
};

/* AnimatedDetailRow */
const getExpandedStateName = state => state ? 'expanded' : 'collapsed';

const expandedStateStyles = {
    'expanded': {
        height: 40,
        opacity: 1
    },
    'collapsed': {
        height: 0,
        opacity: 0
    }
};

const getTransitionStyle = (getStateName, stateStyles) => {
    return (fromState, toState) => {
        let fromName = getStateName(fromState),
            toName = getStateName(toState);

        return {
            from: fromState !== undefined ? stateStyles[fromName] : stateStyles[toName],
            to: stateStyles[toName] 
        };
    }
}

const getDetailRowTransition = getTransitionStyle(getExpandedStateName, expandedStateStyles);

export class AnimatedDetailRow extends React.Component {
    render() {
        return (
            <Transition state={this.props.expanded} getTransition={getDetailRowTransition}>
                {(detailStyles) => {
                    this.props.heightChange(detailStyles.height + 40);
                    return <DetailRow {...this.props} detailStyles={detailStyles} />
                }}
            </Transition>
        );
    }
}
AnimatedDetailRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    row: React.PropTypes.any.isRequired,
    expanded: React.PropTypes.bool.isRequired,
};
/* end of AnimatedDetailRow */

export const detailRowProvider = ({ isExpanded, toggleExpanded, collapsedHeight, expandedHeight }) => {
    return {
        predicate: () => true,
        size: (rowIndex, row) => isExpanded({ rowIndex, row }) ? expandedHeight : collapsedHeight,
        template: ({ rowIndex, row, columns, sizeChange }) => {
            return (
                <AnimatedDetailRow
                    columns={columns}
                    rowIndex={rowIndex}
                    row={row}
                    heightChange={sizeChange}
                    expanded={isExpanded({ rowIndex, row })}/>
            );
        }
    }
}

export class GroupRow extends React.Component {
    render() {
        let { rowProviders } = this.context.gridHost;

        let itemSize = (index) => {
            if(index === 0) 
                return 40;
            if(this.props.expanded)
                return this.props.row.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row, rowProviders })).size(index, row, rowProviders)
                ), 0)
            return 0;
        };
        let itemTemplate = (index) => {
            if(index === 0) {
                return (
                    <div onClick={() => this.props.expandedChange(!this.props.expanded)}
                        style={{ 
                            width: '100%',
                            height: '100%',
                            padding: '10px',
                            borderBottom: '1px solid black',
                            paddingLeft: this.props.row.level * 20 + 10 + 'px',
                            background: '#f8f8f8'
                        }}>
                        {`[${this.props.expanded ? '-' : '+'}] Group: ${this.props.row.value}`}
                    </div>
                );
            }

            return (
                <Rows
                    columns={this.props.columns}
                    rows={this.props.row.items}/>
            );
        };

        return (
            <VirtualBox
                direction="vertical"
                itemCount={2}
                itemInfo={(index) => {
                    return {
                        stick: index === 0 && stickyProp ? 'before' : false,
                        size: itemSize(index)
                    }
                }}
                itemTemplate={itemTemplate}/>
        );
    }
}
GroupRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    row: React.PropTypes.any.isRequired
};
GroupRow.contextTypes = {
    gridHost: React.PropTypes.shape({
        rowProviders: React.PropTypes.array.isRequired,
    }).isRequired
};

export const groupRowProvider = ({ isExpanded, toggleExpanded }) => {
    return {
        predicate: ({ row }) => row.type === 'group',
        size: (rowIndex, row, rowProviders) => {
            let result = 40;
            if(isExpanded({ rowIndex, row })) {
                result = result + row.items.reduce(((accumulator, row, index) =>
                    accumulator + (rowProviderFor({ row, rowProviders })).size(index, row, rowProviders)
                ), 0);
            }
            return result;
        },
        template: ({ rowIndex, row, columns }) => (
            <GroupRow
                columns={columns}
                rowIndex={rowIndex}
                row={row}
                expanded={isExpanded({ rowIndex, row })}
                expandedChange={(expanded) => toggleExpanded({ rowIndex, row, expanded })}/>
        )
    };
};