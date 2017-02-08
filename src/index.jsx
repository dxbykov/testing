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


export class GridContainer extends React.Component {
    constructor(props) {
        super(props)
    }

    calcSortings(columnName) {
        let sorting = this.props.sortings.filter(s => { return s.column == columnName; })[0];
        return [ { column: columnName, direction: (sorting && sorting.direction == 'desc') ? 'asc' : 'desc' } ]
    }

    render() {
        let columnsView = this.props.columns.map(c => {
                let sorting = this.props.sortings.filter(s => { return s.column == c.name; });

                return {
                    name: c.name,
                    sortDirection: sorting.length ? sorting[0].direction : undefined
                };
            }
        );

        let rows = sorty(this.props.rows, this.props.sortings);

        let cellTemplate = this.props.cellTemplate ||
            (({ rowIndex, columnIndex, data }) => <Cell key={`${rowIndex}${columnIndex}`}>{data}</Cell>);

        return (
            <Grid>
                <Header>
                    <Row>
                        {columnsView.map((c, ci) =>
                            <Cell key={ci}><span onClick={() => {
                                this.props.onSort && this.props.onSort(c.name);
                                this.props.sortingsChange && this.props.sortingsChange(this.calcSortings(c.name))
                            }}>{c.sortDirection ? <b>{c.sortDirection}</b> : null}  {c.name}</span></Cell>
                        )}
                    </Row>
                </Header>
                <Body>
                    {rows.map((r, ri) =>
                        <Row key={ri}>
                            {this.props.columns.map((c, ci) => cellTemplate({rowIndex: ri, columnIndex: ci, data: rows[ri][c.name]}))}
                        </Row>
                    )}
                </Body>
            </Grid>
        );
    }
}