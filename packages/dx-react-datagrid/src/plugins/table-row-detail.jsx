import React from 'react';
import { Getter, Template } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';

const expandingHelpers = {
    calcExpanded: (prevExpanded, rowId) => {
        let expandedRows = prevExpanded.slice(),
            expandedIndex = expandedRows.indexOf(rowId);
        
        if(expandedIndex > -1) {
            expandedRows.splice(expandedIndex, 1);
        } else if (expandedIndex === -1) {
            expandedRows.push(rowId)
        }

        return expandedRows;
    },
}

export class TableRowDetail extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            animating: [],
            expanded: props.defaultExpanded || [],
        };

        this.changeExpanded = (expanded) => {
            let prevExpanded = this.props.expanded || this.state.expanded;
            let { expandedChange } = this.props;
            this.setState({ expanded });
            expandedChange && expandedChange(expanded);
            this.setupAnimation(prevExpanded, expanded);
        };
        
        this._tableBodyRows = memoize((rows, expanded, animating) => {
            [...expanded, ...animating].filter((value, index, self) => self.indexOf(value) === index).forEach(rowId => {
                let index = rows.findIndex(row => row.id === rowId);
                if(index !== -1) {
                    let rowIndex = rows.findIndex(row => row.id === rowId);
                    let insertIndex = rowIndex + 1
                    let row = rows[rowIndex];
                    rows = [...rows.slice(0, insertIndex), { type: 'detailRow', id: 'detailRow' + row.id, for: row }, ...rows.slice(insertIndex)]
                }
            })
            return rows
        });
        this._tableColumns = memoize((columns) => [{ type: 'detail', name: 'detail', width: 20 }, ...columns]);
    }
    setupAnimation(prevExpanded, newExpanded) {
        let collapsed = prevExpanded.filter(e => newExpanded.indexOf(e) === -1);
        let expanded = newExpanded.filter(e => prevExpanded.indexOf(e) === -1);

        let changed = [].concat(collapsed).concat(expanded);

        if(changed.length) {
            this.setState({ animating: this.state.animating.concat(changed) });
            setTimeout(() => {
                this.setState({ 
                    animating: this.state.animating.filter(a => changed.indexOf(a) === -1)
                })
            }, 200);
        }
    }
    render() {
        let expanded = this.props.expanded || this.state.expanded;
        let { template } = this.props;
        let { animating } = this.state;

        return (
            <div>
                <Getter name="tableColumns" value={(original) => this._tableColumns(original())}/>
                <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && row.type === 'heading'} />
                <Template name="tableViewCell" predicate={({ column, row }) => column.type === 'detail' && !row.type}>
                    {({ column, row }) => (
                        <div
                            style={{ width: '100%', height: '100%' }}
                            onClick={() => this.changeExpanded(expandingHelpers.calcExpanded(expanded, row.id))}>
                            {expanded.indexOf(row.id) > -1 ? '-' : '+'}
                        </div>
                    )}
                </Template>

                <Getter name="tableBodyRows" value={(original) => this._tableBodyRows(original(), expanded, animating)}/>
                <Getter name="tableCellInfo" value={(original, getter, params) => {
                    const { row, columnIndex } = params;
                    let columns = getter('tableColumns')();          
                    if(row.type === 'detailRow') {
                        if(columnIndex !== 0) {
                            return { skip: true };
                        }
                        return { colspan: columns.length };
                    }
                    return original(params);
                }}/>
                <Template name="tableViewCell" predicate={({ column, row }) => row.type === 'detailRow'}>
                    {({ column, row }) => (
                        <div>
                            {template ? template(row.for) : <div>Hello detail!</div>}
                            {animating.indexOf(row.for.id) > -1 ? 'Animating' : null}
                        </div>
                    )}
                </Template>
            </div>
        )
    }
};