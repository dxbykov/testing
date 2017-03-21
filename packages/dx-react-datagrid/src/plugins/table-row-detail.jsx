import React from 'react';
import { Getter, GetterExtender, Template } from '@devexpress/dx-react-core';
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
            let { expandedChange } = this.props;
            this.setState({ expanded });
            expandedChange && expandedChange(expanded);
        };
        
        this._tableBodyRows = memoize((rows, expanded, animating) => {
            [...expanded, ...animating].filter((value, index, self) => self.indexOf(value) === index).forEach(rowId => {
                let index = rows.findIndex(row => row.id === rowId);
                if(index !== -1) {
                    let rowIndex = rows.findIndex(row => row.id === rowId);
                    let insertIndex = rowIndex + 1
                    rows = [...rows.slice(0, insertIndex), { type: 'detailRow', for: rows[rowIndex] }, ...rows.slice(insertIndex)]
                }
            })
            return rows
        });
        this._tableColumns = memoize((columns) => [{ type: 'detail', width: 20 }, ...columns]);
    }
    componentDidUpdate(prevProps, prevState) {
        let prevExpanded = prevProps.expanded || prevState.expanded;
        let newExpanded = this.props.expanded || this.state.expanded;

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
                <GetterExtender name="tableColumns" value={this._tableColumns}/>
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

                <GetterExtender name="tableBodyRows" value={(rows) => (this._tableBodyRows)(rows, expanded, animating)}/>
                <GetterExtender name="tableCellInfo" value={(original, getter, { row, columnIndex }) => {
                    let columns = getter('tableColumns')();          
                    if(row.type === 'detailRow') {
                        if(columnIndex !== 0) {
                            return { skip: true };
                        }
                        return { colspan: columns.length };
                    }
                    return original;
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