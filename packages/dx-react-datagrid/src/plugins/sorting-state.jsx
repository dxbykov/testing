import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';

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
        super(props);

        this.state = {
            sortings: props.defaultSortings || []
        };

        this.changeSortings = (sortings) => {
            let { sortingsChange } = this.props;
            this.setState({ sortings });
            sortingsChange && sortingsChange(sortings);
        };

        this._rows = memoize((rows, sortings) => sortingsHelper.sort(rows, sortings));
    }
    render() {
        let sortings = this.props.sortings || this.state.sortings;
        
        return (
            <div>
                <Action name="applySorting" action={({ columnName, value }) => this.changeSortings(sortingsHelper.calcSortings(columnName, sortings))} />

                <Getter name="rows" value={(original) => this._rows(original(), sortings)}/>

                <Getter name="sortingFor" value={(_, { columnName }) => sortingsHelper.directionFor(columnName, sortings)} />
            </div>
        )
    }
};