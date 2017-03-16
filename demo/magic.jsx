import React from 'react';

import './magic.css';

import { generateColumns, generateRows } from './demoData';

function memoize( fn ) {
    return function () {
        var args = Array.prototype.slice.call(arguments),
            hash = "",
            i = args.length;
        var currentArg = null;
        while (i--) {
            currentArg = args[i];
            hash += (currentArg === Object(currentArg)) ?
            JSON.stringify(currentArg) : currentArg;
            fn.memoize || (fn.memoize = {});
        }
        return (hash in fn.memoize) ? fn.memoize[hash] :
        fn.memoize[hash] = fn.apply(this, args);
    };
}

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

        this.subscriptions = [];

        this.getters = [];

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
                if(!this.getters[name]) {
                    this.getters[name] = (params) => {
                        let getter = null;
                        this.plugins.forEach(plugin => {
                            if(plugin.getters && plugin.getters[name])
                                getter = plugin.getters[name];
                        });

                        let result = getter(params);

                        this.plugins.forEach(plugin => {
                            if(plugin.getterExtenders && plugin.getterExtenders[name])
                                result = plugin.getterExtenders[name](params, result);
                        });

                        return result;
                    }
                }
                return this.getters[name];
            },
            action: (name) => {
                let action = null;
                this.plugins.forEach(plugin => {
                    if(plugin.actions && plugin.actions[name])
                        action = plugin.actions[name];
                });
                return action;
            },

            forceUpdate: () => this.subscriptions.forEach(subscription => subscription()),
            subscribe: (fn) => this.subscriptions.push(fn),
            unsubscribe: (fn) => this.subscriptions.splice(this.subscriptions.indexOf(fn), 1),
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
                <div id='plugins-root' style={{ display: 'none' }}>
                    <GridTableView />
                    {children}
                </div>
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
        return <TemplatePlaceholder name="tableView" />
    }
}

// Components

export class Connector extends React.PureComponent {
    componentWillMount() {
        let { gridHost } = this.context;
        let { subscribe } = gridHost;

        this.plugin = () => this.forceUpdate()

        subscribe(this.plugin);
    }
    componentWillUnmount() {
        let { gridHost } = this.context;
        let { unsubscribe } = gridHost;

        unsubscribe(this.plugin)
    }
    render() {
        let { gridHost } = this.context;
        let { children, mappings } = this.props;
        let { getter, action } = gridHost;

        let mapped = mappings(getter, action);
        return React.isValidElement(children) ? React.cloneElement(children, mapped) : children(mapped);
    }
};
Connector.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};

export class TemplatePlaceholder extends React.PureComponent {
    render() {
        let { gridHost } = this.context;
        let { template } = gridHost;
        let { params, name } = this.props;

        return template(name)(params);
    }
};
TemplatePlaceholder.contextTypes = {
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
    componentDidUpdate() {
        let { gridHost } = this.context;
        let { forceUpdate } = gridHost;

        forceUpdate();
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
    componentDidUpdate() {
        let { gridHost } = this.context;
        let { forceUpdate } = gridHost;

        forceUpdate();
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
    componentDidUpdate() {
        let { gridHost } = this.context;
        let { forceUpdate } = gridHost;

        forceUpdate();
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

        this.mRows = memoize((rows, filters) => filterHelpers.filter(rows, filters))
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

                <GetterExtender name="rows" value={(rows, getter) => (this.mRows)(rows, getter('filters')())}/>

                <Getter name="filters" value={this.props.filters || this.state.filters} />
                <Getter name="filterFor" value={(getter, { columnName }) => filterHelpers.filterFor(columnName, getter('filters')())} />
            </div>
        )
    }
};


export class FilterRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mTableHeaderRows = memoize((rows) => [...rows, { type: 'filter' }]);
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableHeaderRows" value={this.mTableHeaderRows}/>

                <TemplateExtender name="tableViewCell">
                    {({ column, row }, original) => {
                        if(row.type === 'filter' && !column.type) {
                            return (
                                <Connector
                                    mappings={(getter, action) => ({
                                        filter: getter('filterFor')({ columnName: column.name }),
                                        changeFilter: (value) => action('setColumnFilter')({ columnName: column.name, value })
                                    })}>
                                        {({ filter, changeFilter }) => (
                                            <input
                                                type="text"
                                                value={filter}
                                                onChange={(e) => changeFilter(e.target.value)}
                                                style={{ width: '100%' }}/>
                                        )}
                                </Connector>
                            );
                        }
                        return original;
                    }}
                </TemplateExtender>
            </div>
        )
    }
};


export class HeaderRow extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mTableHeaderRows = memoize((rows, columns) => {
            return [columns.reduce((accum, c) => {
                accum[c.name] = c.title;
                return accum;
            }, { type: 'heading' }), ...rows]
        });
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableHeaderRows" value={(rows, getter) => (this.mTableHeaderRows)(rows, getter('columns')())}/>
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
    constructor(props) {
        super(props)

        this.mRows = memoize((rows, sortings) => sortingsHelper.sort(rows, sortings));
    }
    render() {
        let { sortings, sortingsChange } = this.props;
        
        return (
            <div>
                <Action name="applySorting" action={({ columnName, value }) => sortingsChange(sortingsHelper.calcSortings(columnName, sortings))} />

                <GetterExtender name="rows" value={(rows) => (this.mRows)(rows, sortings)}/>

                <Getter name="sortingFor" value={(_, { columnName }) => sortingsHelper.directionFor(columnName, sortings)} />
            </div>
        )
    }
};

const SortableCell = ({ direction, changeDirection, children }) => (
    <div 
        onClick={changeDirection}
        style={{ width: '100%', height: '100%' }}>
        {children} [{ direction ? (direction === 'desc' ? '↑' : '↓') : '#'}]
    </div>
);

export class HeaderRowSorting extends React.PureComponent {
    render() {
        return (
            <div>
                <TemplateExtender name="tableViewCell">
                    {({ column, row }, original) => {
                        if(row.type === 'heading' && !column.type) {
                            return (
                                <Connector
                                    mappings={(getter, action) => ({
                                        direction: getter('sortingFor')({ columnName: column.name }),
                                        changeDirection: () => action('applySorting')({ columnName: column.name })
                                    })}>
                                        <SortableCell>{original}</SortableCell>
                                </Connector>
                            );
                        }
                        return original;
                    }}
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
const SelectCell = ({ selected, changeSelected }) => (
    <input
        type='checkbox'
        checked={selected}
        onChange={changeSelected}
        style={{ margin: '0' }}/>
);
const SelectAllCell = ({ allSelected, someSelected, toggleAll }) => (
    <input
        type='checkbox'
        checked={allSelected}
        ref={(ref) => { ref && (ref.indeterminate = someSelected)}}
        onChange={toggleAll}
        style={{ margin: '0' }}/>
);

export class Selection extends React.PureComponent {
    constructor(props) {
        super(props);

        this.changeSelected = (rowId) => {
            let { selection, selectionChange } = this.props;
            selectionChange(selectionHelpers.calcSelection(selection, rowId))
        }
        this.toggleAllSelected = (rowId, rows) => {
            let { selection, selectionChange } = this.props;
            selectionChange(selectionHelpers.toggleSelectAll(selection, rows, (row) => row.id))
        }
        
        this.mColumns = memoize((columns) => [{ type: 'select', width: 20 }, ...columns]);
    }
    render() {
        return (
            <div>
                <GetterExtender name="tableColumns" value={this.mColumns}/>

                <TemplateExtender name="tableViewCell">
                    {({ column, row }, original) => {
                        if(column.type === 'select' && row.type === 'heading') {
                            return (
                                <Connector
                                    mappings={(getter) => ({
                                        allSelected: this.props.selection.length === getter('rows')().length,
                                        someSelected: this.props.selection.length !== getter('rows')().length && this.props.selection.length !== 0,
                                        toggleAll: () => this.toggleAllSelected(row.id, getter('rows')()),
                                    })}>
                                    <SelectAllCell/>
                                </Connector>
                            );
                        }
                        if(column.type === 'select' && !row.type) {
                            return (
                                <Connector
                                    mappings={(getter) => ({
                                        selected: this.props.selection.indexOf(row.id) > -1,
                                        changeSelected: () => this.changeSelected(row.id),
                                    })}>
                                    <SelectCell/>
                                </Connector>
                            );
                        }
                        return original;
                    }}
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
        
        this.mTableBodyRows = memoize((rows, expanded, animating) => {
            [...expanded, ...animating].filter((value, index, self) => self.indexOf(value) === index).forEach(e => {
                let index = rows.findIndex(row => row.id === e);
                if(index !== -1) {
                    let insertIndex = rows.findIndex(row => row.id === e) + 1
                    rows = [...rows.slice(0, insertIndex), { type: 'detailRow', for: e }, ...rows.slice(insertIndex)]
                }
            })
            return rows
        });
        this.mTableColumns = memoize((columns) => [{ type: 'detail', width: 20 }, ...columns]);
    }
    componentWillReceiveProps(nextProps) {
        let collapsed = this.props.expanded.filter(e => nextProps.expanded.indexOf(e) === -1);
        let expanded = nextProps.expanded.filter(e => this.props.expanded.indexOf(e) === -1);

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
        return (
            <div>
                <GetterExtender name="tableBodyRows" value={(rows) => (this.mTableBodyRows)(rows, this.props.expanded, this.state.animating)}/>
                <GetterExtender name="tableColumns" value={this.mTableColumns}/>
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
                    {({ column, row }, original) => {
                        if(row.type === 'detailRow') {
                            return (
                                <Connector
                                    mappings={(getter) => ({
                                        rows: getter('rows')(),
                                    })}>
                                        {({ rows }) => {
                                            let { expanded, expandedChange, template } = this.props;
                                            let { animating } = this.state;
                                            return (
                                                <div>
                                                    {template ? template(rows.find(r => r.id === row.for)) : <div>Hello detail!</div>}
                                                    {animating.indexOf(row.for) > -1 ? 'Animating' : null}
                                                </div>
                                            )
                                        }}
                                </Connector>
                            )
                        }
                        if(column.type === 'detail' && row.type === 'heading') {
                            return null;
                        }
                        if(column.type === 'detail' && !row.type) {
                            return (
                                <Connector
                                    mappings={(getter) => ({
                                        rows: getter('rows')(),
                                    })}>
                                        {() => {
                                            let { expanded, expandedChange } = this.props;
                                            return (
                                                <div
                                                    style={{ width: '100%', height: '100%' }}
                                                    onClick={() => expandedChange(selectionHelpers.calcSelection(expanded, row.id))}>
                                                    {expanded.indexOf(row.id) > -1 ? '-' : '+'}
                                                </div>
                                            );
                                        }}
                                </Connector>
                            );
                        }
                        
                        return original;
                    }}
                </TemplateExtender>
            </div>
        )
    }
};
MasterDetail.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}


class StaticTableCell extends React.PureComponent {
    render() {
        let { row, column, colspan, cellContentTemplate } = this.props;
        
        return (
            <td
                style={{ 
                    padding: 0,
                    width: (column.width || 100) + 'px' 
                }}
                colSpan={colspan || 0}>
                {cellContentTemplate({ row, column })}
            </td>
        )
    }
};

class StaticTableRow extends React.PureComponent {
    render() {
        let { row, rowIndex, columns, getCellInfo, cellContentTemplate } = this.props;
        
        return (
            <tr>
                {columns.map((column, columnIndex) => {
                    let info = getCellInfo({ column, row, columnIndex, rowIndex });
                    if(info.skip) return null
                    return (
                        <StaticTableCell key={column.name} row={row} column={column} colspan={info.colspan} cellContentTemplate={cellContentTemplate} />
                    );
                })}
            </tr>
        )
    }
};

class StaticTable extends React.PureComponent {
    render() {
        let { rows, columns, getCellInfo, cellContentTemplate } = this.props;
        
        return (
            <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                    {rows.map((row, rowIndex) => 
                        <StaticTableRow key={row.id} row={row} rowIndex={rowIndex} columns={columns} getCellInfo={getCellInfo} cellContentTemplate={cellContentTemplate} />
                    )}
                </tbody>
            </table>
        );
    }
};

const cellContentTemplate = ({ row, column }) => <TemplatePlaceholder name="tableViewCell" params={{ row, column }} />;

export class GridTableView extends React.PureComponent {
    constructor(props) {
        super(props)

        this.mRows = memoize((headerRows, bodyRows) => [...headerRows, ...bodyRows]);
    }
    render() {
        return (
            <div>
                <Getter name="tableHeaderRows" value={[]}/>
                <Getter name="tableBodyRows" value={(getter) => getter('rows')()}/>
                <Getter name="tableColumns" value={(getter) => getter('columns')()}/>
                <Getter name="tableCellInfo" value={{}}/>

                <Template name="tableView">
                    <Connector
                        mappings={(getter) => ({
                            rows: (this.mRows)(getter('tableHeaderRows')(), getter('tableBodyRows')()),
                            columns: getter('tableColumns')(),
                            getCellInfo: getter('tableCellInfo'),
                            cellContentTemplate: cellContentTemplate,
                        })}>
                        <StaticTable />
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

const rowTemplate = (row) => <div>Detail for {row.name}</div>

export class MagicDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(200),
            sortings: [{ column: 'id', direction: 'asc' }],
            selection: [1, 3, 18],
            expandedRows: [3],
            filters: []
        }

        this.changeExpandedRows = (expandedRows) => this.setState({ expandedRows })
        this.changeSelection = (selection) => this.setState({ selection })
        this.changeSortings = (sortings) => this.setState({ sortings })
        this.changeFilters = (filters) => this.setState({ filters })
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
                        selectionChange={this.changeSelection}/>
                    <MasterDetail
                        expanded={expandedRows}
                        expandedChange={this.changeExpandedRows}
                        template={rowTemplate}/>

                        
                    <SortingState
                        sortings={sortings}
                        sortingsChange={this.changeSortings}/>
                    <FilterState
                        filters={filters}
                        filtersChange={this.changeFilters}/>
                </Grid>

                {/*<h2>Uncontrolled with default filters</h2>
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
                </Grid>*/}
            </div>
        )
    }
};