import React from 'react'
import { GridContainer, Cell } from '../src/index'

export class Local extends React.Component {
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
    }

    render() {
        return (
            <GridContainer 
                columns={this.state.columns} 
                rows={this.state.rows}
                cellTemplate={({ rowIndex, columnIndex, data }) => <Cell key={columnIndex}>[{rowIndex},{columnIndex}] {data}</Cell>}
                />
        );
    }
};