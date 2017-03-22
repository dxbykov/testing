import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';

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

export const sortingDirectionForColumn = sortingsHelper.directionFor;

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

        this._rows = ({ rows, sortings }) => sortingsHelper.sort(rows, sortings);
    }
    render() {
        let sortings = this.props.sortings || this.state.sortings;
        
        return (
            <div>
                <Action name="applySorting" action={({ columnName, value }) => this.changeSortings(sortingsHelper.calcSortings(columnName, sortings))} />

                <Getter name="rows"
                    pureComputed={this._rows}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        sortings
                    })}/>

                <Getter name="sortings" value={sortings} />
            </div>
        )
    }
};