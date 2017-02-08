import React from 'react'
import { GridContainer } from '../src/index'

export class Remote extends React.Component {
    constructor() {
        super();

        this.state = {
            columns: [ { name: 'id', allowSorting: false }, { name: 'name' } ],
            sortings: [ { column: 'name', direction: 'desc' } ],
            rows: [
                { id: 1, name: 'Bob'},
                { id: 2, name: 'Albert'},
                { id: 3, name: 'Robert'}
            ]
        }

        this.onSort = this.onSort.bind(this);


        this.dataSource = (sortings) => {
            return new Promise((resolve, reject) => {
                let sortColumn = sortings[0].column,
                    result = this.state.rows.slice().sort((a, b) => {
                        let value = a[sortColumn] < b[sortColumn] ^ sortings[0].direction === "asc"
                        return value ? -1 : 1;
                    });
                setTimeout(() => {
                    resolve(result)
                }, 300);
            });
        }
    }
    
    onSort(colName) {   
        this.state.sortings.forEach(s => {
            if(s.column == colName) {
                s.direction = s.direction == 'desc' ? 'asc' : 'desc';
            }
        });
        this.setState({ sorting: this.state.sortings });
    }

    applySortings(sortings) {
        this.setState({ loading: true });
        this.dataSource(sortings).then((rows) => {
            this.setState({ sortings, rows, loading: false });
        });
    }

    render() {
        return (
            <div>
                {this.state.loading ? "Loading...": null}
                <GridContainer 
                    columns={this.state.columns} 
                    rows={this.state.rows}
                    sortings={this.state.sortings}
                    sortingsChange={(sortings) => this.applySortings(sortings)}
                    />
            </div>
        );
    }
};