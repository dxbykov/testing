import React from 'react';

import './magic.css';

import { generateColumns, generateRows } from './demoData';


// Core
const filterHelpers = {
    filter: (rows, filters) => {
        if(!filters.length)
            return rows;

        return rows.filter((row) => {
            return filters.reduce((accumulator, filter) => {
                return accumulator && String(row[filter.column]).toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
            }, true);
        });
    },
    filterFor: (columnName, filters) => {
        if(!filters.length)
            return '';
        let filter = filters.filter(s => s.column === columnName)[0];
        return filter ? filter.value : '';
    }
};

// UI
export class FilterState extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            filters: props.defaultFilters || []
        };
    }
    componentWillMount() {
        let { gridHost } = this.context;

        this.plugin = {
            getterExtenders: {
                rows: (_, rows) => {
                    let filters = gridHost.getter('filters')();
                    return filterHelpers.filter(rows, filters);
                },
            },
            getters: {
                filters: () => this.props.filters || this.state.filters,
                filterFor: ({ columnName }) => {
                    let filters = gridHost.getter('filters')();
                    return filterHelpers.filterFor(columnName, filters);
                }
            },
            actions: {
                setColumnFilter: ({ columnName, value }) => {
                    let { filtersChange } = this.props;
                    let onFiltersChange = filters => {
                        this.setState({ filters });
                        filtersChange && filtersChange(filters);
                    };
                    let filters = gridHost.getter('filters')();
                    gridHost.dispatch('setColumnFilter')(filters, { columnName, value }, onFiltersChange);
                }
            },
            reducers: {
                setColumnFilter: (state, payload) => {
                    let { columnName, value } = payload;
                    let filterIndex = state.findIndex(f => { return f.column == columnName; });
                    let nextState = state.slice();
                    if(filterIndex > -1) {
                        nextState.splice(filterIndex, 1, { column: columnName, value: value });
                    } else {
                        nextState.push({ column: columnName, value: value })
                    }
                    return nextState;
                }
            }            
        }
        gridHost.register(this.plugin);
    }
    render() {
        return null
    }
};
FilterState.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}


export class FilterRow extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;

        this.plugin = {
            getterExtenders: {
                tableHeaderRows: (_, rows) => {
                    return [...rows, { type: 'filter' }]
                },
            },
            templateExtenders: {
                tableViewCell: ({ column, row }, original) => {
                    if(row.type === 'filter' && !column.type) {
                        return (
                            <input
                                type="text"
                                value={gridHost.getter('filterFor')({ columnName: column.name })}
                                onChange={(e) => gridHost.action('setColumnFilter')({ columnName: column.name, value: e.target.value })}
                                style={{ width: '100%' }}/>
                        );
                    }
                    return original;
                }
            },
        }
        gridHost.register(this.plugin);
    }
    render() {
        return null
    }
};
FilterRow.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}


export class HeaderRow extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;

        this.plugin = {
            getterExtenders: {
                tableHeaderRows: (_, rows) => {
                    return [gridHost.getter('columns')().reduce((accum, c) => {
                        accum[c.name] = c.title;
                        return accum;
                    }, { type: 'heading' }), ...rows]
                },
            }
        }
        gridHost.register(this.plugin);
    }
    render() {
        return null
    }
};
HeaderRow.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}


// Core
const sortingsHelper = {
    calcSortings: (columnName, prevSorting) => {
        let sorting = prevSorting.filter(s => { return s.column == columnName; })[0];
        return [
            {
                column: columnName,
                direction: (sorting && sorting.direction == 'asc') ? 'desc' : 'asc'
            }
        ];
    },
    directionFor: (columnName, sortings) => {
        let sorting = sortings.filter(s => s.column === columnName)[0];
        return sorting ? sorting.direction : false;
    },
    sort: (rows, sortings) => {
        if(!sortings.length)
            return rows;

        let sortColumn = sortings[0].column,
            result = rows.slice().sort((a, b) => {
                let value = (a[sortColumn] < b[sortColumn]) ^ sortings[0].direction === "desc"
                return value ? -1 : 1;
            });
        return result;
    },
};

// UI
export class SortingState extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;

        this.plugin = {
            getterExtenders: {
                rows: (_, rows) => {
                    let { sortings } = this.props;
                    return sortingsHelper.sort(rows, sortings);
                },
            },
            getters: {
                sortingFor: ({ columnName }) => {
                    let { sortings } = this.props;
                    return sortingsHelper.directionFor(columnName, sortings);
                }
            },
            actions: {
                applySorting: ({ columnName, value }) => {
                    let { sortings, sortingsChange } = this.props;
                    sortingsChange(sortingsHelper.calcSortings(columnName, sortings))
                    gridHost.forceUpdate();
                }
            }
        }
        gridHost.register(this.plugin);
    }
    render() {
        return null
    }
};
SortingState.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export class HeaderRowSorting extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;

        this.plugin = {
            templateExtenders: {
                tableViewCell: ({ column, row }, original) => {
                    if(row.type === 'heading' && !column.type) {
                        let direction = gridHost.getter('sortingFor')({ columnName: column.name });
                        return (
                            <div 
                                onClick={() => gridHost.action('applySorting')({ columnName: column.name })}
                                style={{ width: '100%', height: '100%' }}>
                                {original} [{ direction ? (direction === 'desc' ? '↑' : '↓') : '#'}]
                            </div>
                        );
                    }
                    return original;
                }
            },
        }
        gridHost.register(this.plugin);
    }
    render() {
        return null
    }
};
HeaderRowSorting.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}



// Core
const selectionHelpers = {
    calcSelection: (prevSelection, rowId) => {
        let selectedRows = prevSelection.slice(),
            selectedIndex = selectedRows.indexOf(rowId);
        
        if(selectedIndex > -1) {
            selectedRows.splice(selectedIndex, 1);
        } else if (selectedIndex === -1) {
            selectedRows.push(rowId)
        }

        return selectedRows;
    },
    toggleSelectAll: (prevSelection, rows, getRowId) => {
        if(prevSelection.length === rows.length) {
            return [];
        } else {
            return rows.map(getRowId);
        }
    },
};

// UI
export class Selection extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;

        this.plugin = {
            getterExtenders: {
                tableColumns: (_, columns) => {
                    return [{ type: 'select', width: 20 }].concat(columns);
                },
            },
            templateExtenders: {
                tableViewCell: ({ column, row }, original) => {
                    let { selection, selectionChange } = this.props;
                    let rows = gridHost.getter('rows')();
                    if(column.type === 'select' && row.type === 'heading') {
                        return (
                            <input
                                type='checkbox'
                                checked={selection.length === rows.length}
                                ref={(ref) => { ref && (ref.indeterminate = selection.length !== rows.length && selection.length !== 0)}}
                                onClick={() => { selectionChange(selectionHelpers.toggleSelectAll(selection, rows, (row) => row.id)); gridHost.forceUpdate(); }}
                                style={{ margin: '0' }}/>
                        );
                    }
                    if(column.type === 'select' && !row.type) {
                        return (
                            <input
                                type='checkbox'
                                checked={selection.indexOf(row.id) > -1}
                                onClick={() => { selectionChange(selectionHelpers.calcSelection(selection, row.id)); gridHost.forceUpdate(); }}
                                style={{ margin: '0' }}/>
                        );
                    }
                    return original;
                }
            },
        }
        gridHost.register(this.plugin);
    }
    render() {
        return null
    }
};
Selection.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export class MasterDetail extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;

        this.plugin = {
            getterExtenders: {
                tableBodyRows: (_, rows) => {
                    let { expanded } = this.props;
                    expanded.forEach(e => {
                        let index = rows.findIndex(row => row.id === e);
                        if(index >= 0) {
                            rows.splice(rows.findIndex(row => row.id === e) + 1, 0, { type: 'detailRow', for: e })
                        }
                    })
                    return rows
                },
                tableColumns: (_, columns) => {
                    return [{ type: 'detail', width: 20 }].concat(columns)
                },
                tableCellInfo: ({ row, columnIndex }, original) => {
                    let columns = gridHost.getter('tableColumns')();          
                    if(row.type === 'detailRow') {
                        if(columnIndex !== 0) {
                            return { skip: true };
                        }
                        return { colspan: columns.length };
                    }
                    return original;
                }
            },
            templateExtenders: {
                tableViewCell: ({ column, row }, original) => {
                    let { expanded, expandedChange, template } = this.props;
                    let rows = gridHost.getter('rows')();
                    if(row.type === 'detailRow') {
                        return template ? template(rows.find(r => r.id === row.for)) : <div>Hello detail!</div>
                    }
                    if(column.type === 'detail' && row.type === 'heading') {
                        return null;
                    }
                    if(column.type === 'detail' && !row.type) {
                        return (
                            <div
                                style={{ width: '100%', height: '100%' }}
                                onClick={() => { expandedChange(selectionHelpers.calcSelection(expanded, row.id)); gridHost.forceUpdate(); }}>
                                {expanded.indexOf(row.id) > -1 ? '-' : '+'}
                            </div>
                        );
                    }
                    return original;
                }
            },
        }
        gridHost.register(this.plugin);
    }
    render() {
        return null
    }
};
MasterDetail.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export class Grid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.plugins = [{
            getters: {
                rows: () => props.rows,
                columns: () => props.columns,
            },
        }];

        this.updateSubscribers = [];

        this.host = {
            register: (plugin) => this.plugins.push(plugin),
            template: (name) => {
                let template = null;
                this.plugins.forEach(plugin => {
                    if(plugin.templates && plugin.templates[name])
                        template = plugin.templates[name];
                });
                return (params) => {
                    let result = template(params);

                    this.plugins.forEach(plugin => {
                        if(plugin.templateExtenders && plugin.templateExtenders[name])
                            result = plugin.templateExtenders[name](params, result);
                    });

                    return result;
                };
            },
            getter: (name) => {
                let getter = null;
                this.plugins.forEach(plugin => {
                    if(plugin.getters && plugin.getters[name])
                        getter = plugin.getters[name];
                });
                return (params) => {
                    let result = getter(params);

                    this.plugins.forEach(plugin => {
                        if(plugin.getterExtenders && plugin.getterExtenders[name])
                            result = plugin.getterExtenders[name](params, result);
                    });

                    return result;
                };
            },
            action: (name) => {
                let action = null;
                this.plugins.forEach(plugin => {
                    if(plugin.actions && plugin.actions[name])
                        action = plugin.actions[name];
                });
                return action;
            },

            forceUpdate: () => this.updateSubscribers.forEach(subscription => subscription()),
            subscribeUpdate: (subscription) => this.updateSubscribers.push(subscription),
            dispatch: (actionType) => {
                let reducer = null;
                this.plugins.forEach(plugin => {
                    if(plugin.reducers && plugin.reducers[actionType])
                        reducer = plugin.reducers[actionType];
                });
                return (state, payload, setState) => {
                    let result = reducer(state, payload);

                    if(result !== state) {
                        setState(result);
                        this.host.forceUpdate();
                    }

                    console.log({ type: actionType, payload, state, nextState: result });
                };
            },
        };
    }
    getChildContext() {
        return {
            gridHost: this.host
        }
    }
    render() {
        let { children } = this.props;

        return (
            <div>
                {children}
                <GridTableView />
                <RootRenderer />
            </div>
        )
    }
};
Grid.propTypes = {
    rows: React.PropTypes.array.isRequired,
    columns: React.PropTypes.array.isRequired,
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class RootRenderer extends React.PureComponent {
    render() {
        let { gridHost } = this.context;
        let { template } = gridHost;

        return template('tableView')()
    }
}
RootRenderer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class Connector extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { subscribeUpdate } = gridHost;

        subscribeUpdate(() => this.forceUpdate())
    }

    render() {
        let { children, mappings } = this.props;

        return React.cloneElement(children, mappings());
    }
};
Connector.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class GridTableView extends React.Component {
    constructor(props, context) {
        super(props, context);

        let { gridHost } = context;

        this.plugin = {
            getters: {
                tableHeaderRows: () => [],
                tableBodyRows: () => gridHost.getter('rows')(),
                tableColumns: () => gridHost.getter('columns')(),
                tableCellInfo: () => ({}), // NO WATCH
            },
            templates: {
                tableViewCell: ({ row, column }) => (
                    row[column.name]
                ),
                tableView: () => {
                    let StaticTable = ({ rows, columns }) => (
                        <table style={{ borderCollapse: 'collapse' }}>
                            {rows.map((row, rowIndex) => 
                                <tr key={row.id}>
                                    {columns.map((column, columnIndex) => {
                                        let info = gridHost.getter('tableCellInfo')({ column, row, columnIndex, rowIndex });
                                        if(info.skip) return null
                                        return (
                                            <td
                                                key={column.name}
                                                style={{ width: (column.width || 100) + 'px' }}
                                                colSpan={info.colspan || 0}>
                                                {gridHost.template('tableViewCell')({ row, column })}
                                            </td>
                                        );
                                    })}
                                </tr>
                            )}
                        </table>
                    );

                    return (
                        <Connector
                            mappings={() => ({
                                rows: ((headerRows, bodyRows) => [...headerRows, ...bodyRows])(gridHost.getter('tableHeaderRows')(), gridHost.getter('tableBodyRows')()),
                                columns: gridHost.getter('tableColumns')(),
                            })}>
                            <StaticTable/>
                        </Connector>
                    )
                },
            },
        }
    }
    componentWillMount() {
        let { gridHost } = this.context;

        gridHost.register(this.plugin)
    }
    render() {
        return null
    }
}
GridTableView.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export class MagicDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(20),
            sortings: [{ column: 'id', direction: 'asc' }],
            selection: [1, 3, 18],
            expandedRows: [3],
            filters: []
        }
    }

    render() {
        let { rows, columns, sortings, selection, expandedRows, filters } = this.state;

        return (
            <div>
                <Grid
                    rows={rows}
                    columns={columns}>
                    
                    <HeaderRow/>
                    <HeaderRowSorting/>

                    <FilterRow/>

                    <Selection
                        selection={selection}
                        selectionChange={selection => this.setState({ selection })}/>
                    <MasterDetail
                        expanded={expandedRows}
                        expandedChange={expandedRows => this.setState({ expandedRows })}
                        template={(row) => <div>Detail for {row.name}</div>}/>

                        
                    <SortingState
                        sortings={sortings}
                        sortingsChange={sortings => this.setState({ sortings })}/>
                    <FilterState
                        filters={filters}
                        filtersChange={filters => this.setState({ filters })}/>
                </Grid>

                <h2>Uncontrolled with default filters</h2>
                <Grid
                    rows={rows}
                    columns={columns}>
                    
                    <HeaderRow/>
                    <HeaderRowSorting/>

                    <FilterRow/>
                    <FilterState defaultFilters={[ { column: 'name', value: 'She' } ]}/>

                    <Selection
                        selection={selection}
                        selectionChange={selection => this.setState({ selection })}/>
                    <MasterDetail
                        expanded={expandedRows}
                        expandedChange={expandedRows => this.setState({ expandedRows })}
                        template={(row) => <div>Detail for {row.name}</div>}/>

                        
                    <SortingState
                        sortings={sortings}
                        sortingsChange={sortings => this.setState({ sortings })}/>
                </Grid>
            </div>
        )
    }
};