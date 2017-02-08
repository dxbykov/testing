import React from 'react'
import { GridContainer, Cell, Pager } from '../src/index'

export class Local extends React.Component {
    constructor() {
        super();

        this.state = {
            columns: [ { name: 'id', allowSorting: false }, { name: 'name' } ],
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
            ],
            pageSize: 3
        }
    }

    render() {
        return (
            <div>
                <GridContainer 
                    columns={this.state.columns}
                    rows={this.state.rows}
                    cellTemplate={({ rowIndex, columnIndex, data }) => <Cell key={columnIndex}>[{rowIndex},{columnIndex}] {data}</Cell>}
                    pageSize={this.state.pageSize}
                />
            </div>
        );
    }
};