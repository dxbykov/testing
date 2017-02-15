import React from 'react';

export const Cell = (props) => {
    return (
        <dx-cell>
            {props.children}
        </dx-cell>
    );
}

export const Row = (props) => {
    return (
        <dx-row>
            {props.children}
        </dx-row>
    );
}

export const GroupRow = (props) => {
    return (
        <dx-row class={'dx-group-row'}>
            {props.children}
        </dx-row>
    );
}

export const Body = (props) => {
    return (
        <dx-body>
            {props.children}
        </dx-body>
    );
}

export const Header = (props) => {
    return (
        <dx-header>
            {props.children}
        </dx-header>
    );
}

export const Footer = (props) => {
    return (
        <dx-footer>
            {props.children}
        </dx-footer>
    );
}

export const Grid = (props) => {
    return (
        <dx-grid>
            {props.children}
        </dx-grid>
    );
}

export const Pager = (props) => {
    let pages = [];
    for(let i = 0; i < props.totalCount / props.pageSize; i ++)
        pages.push(i + 1);

    return (
        <dx-pager>
            {pages.map((_, pageIndex) =>
                <dx-page key={pageIndex} active={props.page === pageIndex} onClick={() => props.pageChange(pageIndex)}>
                    {pageIndex}
                </dx-page>)}
        </dx-pager>
    );
}

export const Grouper = (props) => {
    let groups = props.columns.map(c => {
        return {
            column: c.name,
            grouped: props.grouping.filter(g => g.column === c.name).length > 0
        };
    });

    return (
        <dx-grouper>
            {groups.map((group, groupIndex) =>
                <dx-page key={groupIndex} active={group.grouped} onClick={() => props.groupChange(group.column)}>
                    {group.column}
                </dx-page>)}
        </dx-grouper>
    );
}

export const DefaultCellTemplate = (props) => {
    return <Cell key={`${props.rowIndex}_${props.columnIndex}`}>{props.data}</Cell>;
};

export const GridView = (props) => {
    let columnsView = props.columns.map(c => {
            let sorting = props.sortings.filter(s => { return s.column == c.name; });

            return {
                name: c.name,
                sortDirection: sorting.length ? sorting[0].direction : undefined
            };
        }
    );

    let cellTemplate = props.cellTemplate || DefaultCellTemplate;

    return (
        <Grid>
            <Header>
                <Row>
                    {columnsView.map((c, ci) =>
                        <Cell key={ci}>
                            <span onClick={() => { props.onSort(c.name); }}>
                                {c.name} {c.sortDirection ? <b>{c.sortDirection === 'asc' ? '↓' : '↑'}</b> : null}
                            </span>
                        </Cell>
                    )}
                </Row>
            </Header>
            <Body>
                {props.rows.map((r, ri) => {
                        if(r.isGroupRow) {
                            return <GroupRow key={ri}>{r.column}: {r.key}</GroupRow>
                        }
                        else {
                            return <Row key={ri}>
                                {props.columns.map((c, ci) => cellTemplate({ rowIndex: ri, columnIndex: ci, data: props.rows[ri][c.name] }))}
                            </Row>
                        }
                    }
                )}
            </Body>
            <Footer>
                {props.footerTemplate}
            </Footer>
        </Grid>
    );
}

export function sorty(data, sortings) {
    if(!sortings.length)
        return data;

    let sortColumn = sortings[0].column,
        result = data.slice().sort((a, b) => {
            let value = (a[sortColumn] < b[sortColumn]) ^ sortings[0].direction === "desc"
            return value ? -1 : 1;
        });
    return result;
}

export class GridContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            sortings: [],
            pageSize: 3,
            page: 0
        }

        this.onSort = this.onSort.bind(this);
    }
    
    componentWillReceiveProps(nextProps) {
        Object.keys(this.state).forEach(propName => {
            const controlledValue = nextProps[propName];

            if (controlledValue !== undefined &&
                controlledValue !== this.state[propName]
            ) {
                this.setState({
                    [propName]: controlledValue
                });
            }
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        let result = false;

        Object.keys(this.props).forEach(propName => {
            if(nextProps[propName] !== this.props[propName]) {
                result = result || nextProps[propName] !== this.props[propName];
            }
        });

        if(!result) {
            Object.keys(this.state).forEach(propName => {
                if (nextProps[propName] !== undefined) {
                    result = result || nextProps[propName] !== this.props[propName];
                }
                else {
                    result = result || nextState[propName] !== this.state[propName];
                }
            });
        }

        return result;
    }

    get(prop) {
        return this.props[prop] !== undefined ? this.props[prop] : this.state[prop];
    }

    set(prop, value) {
        if (value === this.state[prop]) return;

        /*
            The second parameter is an optional callback function that will be executed once setState is completed and
            the component is re-rendered. Generally we recommend using componentDidUpdate() for such logic instead.
        */

        this.setState({
            [prop]: value,
        }, () => {
            this.props[prop + 'Change'] && this.props[prop + 'Change'](value);
        });
    }

    get sortings() {
        return this.get('sortings');
    }
    set sortings(value) {
        this.set('sortings', value);
    }

    get page() {
        return this.get('page');
    }
    set page(value) {
        this.set('page', value);
    }

    get pageSize() {
        return this.get('pageSize');
    }
    set pageSize(value) {
        this.set('pageSize', value);
    }

    calcSortings(columnName) {
        let sorting = this.sortings.filter(s => { return s.column == columnName; })[0];
        return [ { column: columnName, direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc' } ]
    }

    onSort(columnName) {
        this.sortings = this.calcSortings(columnName);
    }

    render() {
        let rows = this.props.visibleRows;
        
        if(rows === undefined) {
            rows = sorty(this.props.rows, this.sortings)
                .slice(this.pageSize * this.page, this.pageSize * (this.page + 1));
        }

        let viewProps = {
            ...this.props,
            rows,
            sortings: this.sortings,
            onSort: this.props.onSort || this.onSort
        };

        return (
            <div>
                <GridView {...viewProps}></GridView>
            </div>
        );
    }
}