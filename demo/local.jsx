import React from 'react'
import { GridContainer } from '../src/index'

export class Local extends React.Component {
    constructor() {
        super();

        this.state = {
            columns: [ { name: 'id', allowSorting: false }, { name: 'name' } ],
            sortings: [ { column: 'name', direction: 'desc' } ],
            rows: [
                { id: 1, name: 'Albert'},
                { id: 2, name: 'Adel'},
                { id: 3, name: 'Robert'}
            ]
        }
    }

    render() {
        return (
            <GridContainer 
                columns={this.state.columns} 
                rows={this.state.rows}
                sortings={this.state.sortings}
                sortingsChange={(sortings) => this.setState({ sortings })}
                />
        );
    }
};