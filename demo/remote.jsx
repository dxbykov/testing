import React from 'react'
import { GridContainer, sorty } from '../src/index'

export class Remote extends React.Component {
    constructor() {
        super();

        this.state = {
            columns: [ { name: 'id', allowSorting: false }, { name: 'name' } ],
            sortings: [ { column: 'name', direction: 'desc' } ],
            page: 0,
            pageSize: 2,
            rows: [
                { id: 1, name: 'Bob'},
                { id: 2, name: 'Albert'},
                { id: 3, name: 'Robert'},
                { id: 4, name: 'Poul'},
                { id: 5, name: 'Azbest'},
                { id: 6, name: 'Vova'},
                { id: 7, name: 'Sonay'},
                { id: 8, name: 'Marry'},
                { id: 9, name: 'Sherlock'}
            ]
        }

        this.onSort = this.onSort.bind(this);


        this.dataSource = (params) => {
            return new Promise((resolve, reject) => {
                let rows = sorty(this.state.rows, params.sortings)
                    .slice(this.state.pageSize * this.state.page, this.state.pageSize * (this.state.page + 1));
                setTimeout(() => {
                    resolve(rows);
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
        this.dataSource({ sortings, page: this.state.page }).then((rows) => {
            this.setState({ sortings, rows, loading: false });
        });
    }

    applyPage(page) {
        this.setState({ loading: true });
        this.dataSource({ page, sortings: this.state.sortings }).then((rows) => {
            this.setState({ page, rows, loading: false });
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
                    page={this.state.page}
                    pageChange={(page) => this.applyPage(page)}
                    pageSize={this.state.pageSize}
                    />
            </div>
        );
    }
};