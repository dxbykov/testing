import React from 'react';

import './magic.css';

import { generateColumns, generateRows } from './demoData';


// Host

export class Grid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.plugins = [{
            getters: {
                rows: () => props.rows,
                columns: () => props.columns,
            },
        }];

        this.host = {
            register: (plugin) => this.plugins.push(plugin),
            unregister: (plugin) => this.plugins.splice(this.plugins.indexOf(plugin), 1),

            template: (name) => {
                let template = null;
                this.plugins.forEach(plugin => {
                    if(plugin.templates && plugin.templates[name])
                        template = plugin.templates[name];
                });
                return (params) => {
                    let result = React.isValidElement(template) ? React.cloneElement(template, params) : template(params);
                    
                    this.plugins.forEach(plugin => {
                        if(plugin.templateExtenders && plugin.templateExtenders[name]) {
                            let templateExtender = plugin.templateExtenders[name];
                            
                            result = React.isValidElement(templateExtender)
                                ? React.cloneElement(templateExtender, Object.assign({ original: result }, params))
                                : templateExtender(params, result);
                        }
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

            forceUpdate: () => this.plugins.forEach(plugin => plugin.onUpdate && plugin.onUpdate()),
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

// Components

export class Connector extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { register } = gridHost;

        this.plugin = {
            onUpdate: () => this.forceUpdate()
        };

        register(this.plugin);
    }
    componentWillUnmount() {
        let { gridHost } = this.context;
        let { unregister } = gridHost;

        unregister(this.plugin)
    }
    render() {
        let { gridHost } = this.context;
        let { children, mappings } = this.props;

        let mapped = mappings(gridHost);
        return React.isValidElement(children) ? React.cloneElement(children, mapped) : children(mapped);
    }
};
Connector.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class Template extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { register } = gridHost;
        let { children, name } = this.props;

        this.plugin = {
            templates: {
                [name]: children
            }
        };

        register(this.plugin);
    }
    componentWillUnmount() {
        let { gridHost } = this.context;
        let { unregister } = gridHost;

        unregister(this.plugin)
    }
    render() {
        return null;
    }
};
Template.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class TemplateExtender extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { register } = gridHost;
        let { children, name } = this.props;

        this.plugin = {
            templateExtenders: {
                [name]: children
            }
        };

        register(this.plugin);
    }
    componentWillUnmount() {
        let { gridHost } = this.context;
        let { unregister } = gridHost;

        unregister(this.plugin)
    }
    render() {
        return null;
    }
};
TemplateExtender.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class Getter extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { register } = gridHost;
        let { name } = this.props;

        this.plugin = {
            getters: {
                [name]: (params) => {
                    let { value } = this.props;
                    return typeof value === "function" ? value(gridHost.getter, params) : value
                }
            }
        };

        register(this.plugin);
    }
    componentWillUnmount() {
        let { gridHost } = this.context;
        let { unregister } = gridHost;

        unregister(this.plugin)
    }
    render() {
        return null;
    }
};
Getter.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class GetterExtender extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { register } = gridHost;
        let { name } = this.props;

        this.plugin = {
            getterExtenders: {
                [name]: (params, original) => {
                    let { value } = this.props;
                    return typeof value === "function" ? value(original, gridHost.getter, params) : value
                }
            }
        };

        register(this.plugin);
    }
    componentWillUnmount() {
        let { gridHost } = this.context;
        let { unregister } = gridHost;

        unregister(this.plugin)
    }
    render() {
        return null;
    }
};
GetterExtender.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class Action extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { register, getter, forceUpdate } = gridHost;
        let { name } = this.props;

        this.plugin = {
            actions: {
                [name]: (params) => {
                    let { action } = this.props;
                    action(params, getter)
                    forceUpdate();
                }
            }
        };

        register(this.plugin);
    }
    componentWillUnmount() {
        let { gridHost } = this.context;
        let { unregister } = gridHost;

        unregister(this.plugin)
    }
    render() {
        return null;
    }
};
Action.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};



// Plugins

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
    },
    calcFilters: ({ columnName, value }, filters) => {
        let filterIndex = filters.findIndex(f => { return f.column == columnName; });
        let nextState = filters.slice();
        if(filterIndex > -1) {
            nextState.splice(filterIndex, 1, { column: columnName, value: value });
        } else {
            nextState.push({ column: columnName, value: value })
        }
        return nextState;
    }
};

// UI
export class FilterState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            filters: props.defaultFilters || []
        };
    }
    render() {
        return (
            <div>
                <Action name="setColumnFilter" action={({ columnName, value }, getter) => {
                    let { filtersChange } = this.props;
                    let filters = filterHelpers.calcFilters({ columnName, value }, getter('filters')());
                    this.setState({ filters });
                    filtersChange && filtersChange(filters);
                }} />

                <GetterExtender name="rows" value={(rows, getter) => filterHelpers.filter(rows, getter('filters')())}/>

                <Getter name="filters" value={this.props.filters || this.state.filters} />
                <Getter name="filterFor" value={(getter, { columnName }) => filterHelpers.filterFor(columnName, getter('filters')())} />
            </div>
        )
    }
};


export class FilterRow extends React.PureComponent {
    render() {
        return (
            <div>
                <GetterExtender name="tableHeaderRows" value={(rows, getter) => [...rows, { type: 'filter' }]}/>

                <TemplateExtender name="tableViewCell">
                    {({ column, row }, original) => (
                        <Connector
                            mappings={(gridHost) => ({
                                filterFor: gridHost.getter('filterFor'),
                                setColumnFilter: gridHost.action('setColumnFilter')
                            })}>
                                {({ filterFor, setColumnFilter }) => {
                                    if(row.type === 'filter' && !column.type) {
                                        return (
                                            <input
                                                type="text"
                                                value={filterFor({ columnName: column.name })}
                                                onChange={(e) => setColumnFilter({ columnName: column.name, value: e.target.value })}
                                                style={{ width: '100%' }}/>
                                        );
                                    }
                                    return original;
                                }}
                        </Connector>
                    )}
                </TemplateExtender>
            </div>
        )
    }
};


export class HeaderRow extends React.PureComponent {
    render() {
        return (
            <div>
                <GetterExtender name="tableHeaderRows" value={(rows, getter) => {
                    return [getter('columns')().reduce((accum, c) => {
                        accum[c.name] = c.title;
                        return accum;
                    }, { type: 'heading' }), ...rows]
                }}/>
            </div>
        )
    }
};


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
    render() {
        let { sortings, sortingsChange } = this.props;
        
        return (
            <div>
                <Action name="applySorting" action={({ columnName, value }) => sortingsChange(sortingsHelper.calcSortings(columnName, sortings))} />

                <GetterExtender name="rows" value={(rows) => sortingsHelper.sort(rows, sortings)}/>

                <Getter name="sortingFor" value={(_, { columnName }) => sortingsHelper.directionFor(columnName, sortings)} />
            </div>
        )
    }
};

export class HeaderRowSorting extends React.PureComponent {
    render() {
        return (
            <div>
                <TemplateExtender name="tableViewCell">
                    {({ column, row }, original) => (
                        <Connector
                            mappings={(gridHost) => ({
                                direction: gridHost.getter('sortingFor')({ columnName: column.name }),
                                changeDirection: () => gridHost.action('applySorting')({ columnName: column.name })
                            })}>
                                {({ direction, changeDirection }) => {
                                    if(row.type === 'heading' && !column.type) {
                                        return (
                                            <div 
                                                onClick={changeDirection}
                                                style={{ width: '100%', height: '100%' }}>
                                                {original} [{ direction ? (direction === 'desc' ? '↑' : '↓') : '#'}]
                                            </div>
                                        );
                                    }
                                    return original;
                                }}
                        </Connector>
                    )}
                </TemplateExtender>
            </div>
        )
    }
};


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
    render() {
        return (
            <div>
                <GetterExtender name="tableColumns" value={(columns) => [{ type: 'select', width: 20 }].concat(columns)}/>

                <TemplateExtender name="tableViewCell">
                    {({ column, row }, original) => (
                        <Connector
                            mappings={(gridHost) => ({
                                rows: gridHost.getter('rows')(),
                                forceUpdate: gridHost.forceUpdate, // TODO: remove
                            })}>
                                {({ rows, forceUpdate }) => {
                                    let { selection, selectionChange } = this.props;
                                    if(column.type === 'select' && row.type === 'heading') {
                                        return (
                                            <input
                                                type='checkbox'
                                                checked={selection.length === rows.length}
                                                ref={(ref) => { ref && (ref.indeterminate = selection.length !== rows.length && selection.length !== 0)}}
                                                onClick={() => { selectionChange(selectionHelpers.toggleSelectAll(selection, rows, (row) => row.id)); forceUpdate(); }}
                                                style={{ margin: '0' }}/>
                                        );
                                    }
                                    if(column.type === 'select' && !row.type) {
                                        return (
                                            <input
                                                type='checkbox'
                                                checked={selection.indexOf(row.id) > -1}
                                                onClick={() => { selectionChange(selectionHelpers.calcSelection(selection, row.id)); forceUpdate(); }}
                                                style={{ margin: '0' }}/>
                                        );
                                    }
                                    return original;
                                }}
                        </Connector>
                    )}
                </TemplateExtender>
            </div>
        )
    }
};

export class MasterDetail extends React.PureComponent {
    constructor(props, context) {
        super(props, context);

        this.state = {
            animating: []
        }
    }
    componentWillReceiveProps(nextProps) {
        let collapsed = this.props.expanded.filter(e => nextProps.expanded.indexOf(e) === -1);
        let expanded = nextProps.expanded.filter(e => this.props.expanded.indexOf(e) === -1);

        this.setState({ animating: this.state.animating.concat(collapsed).concat(expanded) });

        if(collapsed.length || expanded.length) {
            setTimeout(() => {
                this.setState({ 
                    animating: this.state.animating.filter(a => !(collapsed.indexOf(a) !== -1 || expanded.indexOf(a) !== -1))
                })

                let { gridHost } = this.context;
                gridHost.forceUpdate();
            }, 200);
        }
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableBodyRows" value={(rows) => {
                    let { expanded } = this.props;
                    let { animating } = this.state;
                    [...expanded, ...animating].filter((value, index, self) => self.indexOf(value) === index).forEach(e => {
                        let index = rows.findIndex(row => row.id === e);
                        if(index !== -1) {
                            rows.splice(rows.findIndex(row => row.id === e) + 1, 0, { type: 'detailRow', for: e })
                        }
                    })
                    return rows
                }}/>
                <GetterExtender name="tableColumns" value={(columns) => [{ type: 'detail', width: 20 }].concat(columns)}/>
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

                <TemplateExtender name="tableViewCell">
                    {({ column, row }, original) => (
                        <Connector
                            mappings={(gridHost) => ({
                                rows: gridHost.getter('rows')(),
                                forceUpdate: gridHost.forceUpdate,
                            })}>
                                {({ rows, forceUpdate }) => {
                                    let { expanded, expandedChange, template } = this.props;
                                    let { animating } = this.state;
                                    if(row.type === 'detailRow') {
                                        return (
                                            <div>
                                                {template ? template(rows.find(r => r.id === row.for)) : <div>Hello detail!</div>}
                                                {animating.indexOf(row.for) > -1 ? 'Animating' : null}
                                            </div>
                                        )
                                    }
                                    if(column.type === 'detail' && row.type === 'heading') {
                                        return null;
                                    }
                                    if(column.type === 'detail' && !row.type) {
                                        return (
                                            <div
                                                style={{ width: '100%', height: '100%' }}
                                                onClick={() => { expandedChange(selectionHelpers.calcSelection(expanded, row.id)); forceUpdate(); }}>
                                                {expanded.indexOf(row.id) > -1 ? '-' : '+'}
                                            </div>
                                        );
                                    }
                                    
                                    return original;
                                }}
                        </Connector>
                    )}
                </TemplateExtender>
            </div>
        )
    }
};
MasterDetail.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}


const StaticTable = ({ rows, columns, getCellInfo, cellContentTemplate }) => (
    <table style={{ borderCollapse: 'collapse' }}>
        {rows.map((row, rowIndex) => 
            <tr key={row.id}>
                {columns.map((column, columnIndex) => {
                    let info = getCellInfo({ column, row, columnIndex, rowIndex });
                    if(info.skip) return null
                    return (
                        <td
                            key={column.name}
                            style={{ 
                                padding: 0,
                                width: (column.width || 100) + 'px' 
                            }}
                            colSpan={info.colspan || 0}>
                            {cellContentTemplate({ row, column })}
                        </td>
                    );
                })}
            </tr>
        )}
    </table>
);

export class GridTableView extends React.Component {
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows" value={[]}/>
                <Getter name="tableBodyRows" value={(getter) => getter('rows')()}/>
                <Getter name="tableColumns" value={(getter) => getter('columns')()}/>
                <Getter name="tableCellInfo" value={{}}/>

                <Template name="tableView">
                    <Connector
                        mappings={(gridHost) => ({
                            rows: ((headerRows, bodyRows) => [...headerRows, ...bodyRows])(gridHost.getter('tableHeaderRows')(), gridHost.getter('tableBodyRows')()),
                            columns: gridHost.getter('tableColumns')(),
                            getCellInfo: gridHost.getter('tableCellInfo'),
                            cellContentTemplate: gridHost.template('tableViewCell'),
                        })}>
                        <StaticTable/>
                    </Connector>
                </Template>
                <Template name="tableViewCell">
                    {({ row, column }) => (row[column.name] !== undefined ? <span>{row[column.name]}</span> : null)}
                </Template>
            </div>
        )
    }
}


// Demo

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