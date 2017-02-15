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
            originalRows: [
                { id: 1, name: 'Bob'},
                { id: 2, name: 'Albert'},
                { id: 3, name: 'Robert'},
                { id: 4, name: 'Poul'},
                { id: 5, name: 'Azbest'},
                { id: 6, name: 'Vova'},
                { id: 7, name: 'Sonay'},
                { id: 8, name: 'Marry'},
                { id: 9, name: 'Sherlock'}
            ],
            visibleRows: []
        }

        this.onSort = this.onSort.bind(this);


        this.dataSource = (params) => {
            params.page = params.page || 0;
            params.sortings = params.sortings || [];
            return new Promise((resolve, reject) => {
                let rows = sorty(this.state.originalRows, params.sortings)
                    .slice(this.state.pageSize * this.state.page, this.state.pageSize * (this.state.page + 1));
                setTimeout(() => {
                    resolve(rows);
                }, 300);
            });
        }
    }
    
    componentDidMount() {
        this.reload({
            page: this.state.page,
            sortings: this.state.sortings
        });
    }

    onSort(colName) {   
        this.state.sortings.forEach(s => {
            if(s.column == colName) {
                s.direction = s.direction == 'desc' ? 'asc' : 'desc';
            }
        });
        this.setState({ sorting: this.state.sortings });
    }

    reload(params) {
        this.setState({ loading: true });
        this.dataSource(params).then((rows) => {
            this.setState({ visibleRows: rows, loading: false });
        });
    }

    applySortings(sortings) {
        this.reload({
            page: this.state.page,
            sortings
        });
        this.setState({ sortings });
    }

    applyPage(page) {
        this.reload({
            page,
            sortings: this.state.sortings
        });
        this.setState({ page });
    }

    render() {
        return (
            <div>
                {this.state.loading ? "Loading...": null}
                <GridContainer
                    columns={this.state.columns}
                    visibleRows={this.state.visibleRows}
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