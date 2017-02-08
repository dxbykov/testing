import React from 'react';

export class Cell extends React.Component {
    render() {
        return (
            <dx-cell>
                {this.props.children}
            </dx-cell>
        );
    }
}

export class Row extends React.Component {
    render() {
        return (
            <dx-row>
                {this.props.children}
            </dx-row>
        );
    }
}

export class Body extends React.Component {
    render() {
        return (
            <dx-body>
                {this.props.children}
            </dx-body>
        );
    }
}

export class Header extends React.Component {
    render() {
        return (
            <dx-header>
                {this.props.children}
            </dx-header>
        );
    }
}

export class Grid extends React.Component {
    render() {
        return (
            <dx-grid>
                {this.props.children}
            </dx-grid>
        );
    }
}


function sorty(data, sortings) {
    if(!sortings.length)
        return data;

    let sortColumn = sortings[0].column,
        result = data.slice().sort((a, b) => {
            let value = (a[sortColumn] < b[sortColumn]) ^ sortings[0].direction === "asc"
            return value ? -1 : 1;
        });
    return result;
}

export class Pager extends React.Component {
    render() {
        let pages = [];
        for(let i = 0; i < this.props.rowCount / this.props.pageRowCount; i ++)
            pages.push(i + 1);

        return (
            <dx-pager>
                {pages.map((_, pageIndex) =>
                    <dx-page active={this.props.page === pageIndex} onClick={() => this.props.pageChange(pageIndex)}>
                        {pageIndex}
                    </dx-page>)}
            </dx-pager>
        );
    }    
}

export class GridContainer extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            sortings: []
        }
    }
    
    componentWillReceiveProps(nextProps) {  
        const controlledValue = nextProps['sortings'];

        if (controlledValue !== undefined &&
            controlledValue !== this.state['sortings']
        ) {
            this.setState({
                ['sortings']: controlledValue,
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return true;
        // if (nextProps['sortings'] !== undefined) {
        //     return nextProps['sortings'] !== this.props['sortings'];
        // }
        // return nextState['sortings'] !== this.state['sortings'];
    }

    get sortings() {
        return this.props['sortings'] !== undefined ? this.props['sortings'] : this.state['sortings'];
    }

    set sortings(value) {
        if (value === this.state['sortings']) return;

        this.setState({
            ['sortings']: value,
        }, () => {
            this.props['sortings' + 'Change'] && this.props['sortings' + 'Change'](value);
        });
    }

    calcSortings(columnName) {
        let sorting = this.sortings.filter(s => { return s.column == columnName; })[0];
        return [ { column: columnName, direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc' } ]
    }

    render() {
        let columnsView = this.props.columns.map(c => {
                let sorting = this.sortings.filter(s => { return s.column == c.name; });

                return {
                    name: c.name,
                    sortDirection: sorting.length ? sorting[0].direction : undefined
                };
            }
        );

        let rows = sorty(this.props.rows, this.sortings);

        let cellTemplate = this.props.cellTemplate ||
            (({ rowIndex, columnIndex, data }) => <Cell key={`${rowIndex}${columnIndex}`}>{data}</Cell>);

        return (
            <Grid>
                <Header>
                    <Row>
                        {columnsView.map((c, ci) =>
                            <Cell key={ci}>
                                <span onClick={() => { this.sortings = this.calcSortings(c.name)}}>
                                    {c.name} {c.sortDirection ? <b>{c.sortDirection}</b> : null}
                                </span>
                            </Cell>
                        )}
                    </Row>
                </Header>
                <Body>
                    {rows.map((r, ri) =>
                        <Row key={ri}>
                            {this.props.columns.map((c, ci) => cellTemplate({ rowIndex: ri, columnIndex: ci, data: rows[ri][c.name] }))}
                        </Row>
                    )}
                </Body>
            </Grid>
        );
    }
}