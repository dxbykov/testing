import React from 'react';
import { Getter, GetterExtender, Action } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';

// Core
const filterHelpers = {
    filter: (rows, filters) => {
        if(!filters.length)
            return rows;

        return rows.filter((row) => {
            return filters.reduce((accumulator, filter) => {
                return accumulator && String(row[filter.column]).toLowerCase().indexOf(filter.value.toLowerCase()) > -1;
            }, true);
        });
    },
    filterFor: (columnName, filters) => {
        if(!filters.length)
            return '';
        let filter = filters.filter(s => s.column === columnName)[0];
        return filter ? filter.value : '';
    },
    calcFilters: ({ columnName, value }, filters) => {
        let filterIndex = filters.findIndex(f => { return f.column == columnName; });
        let nextState = filters.slice();
        if(filterIndex > -1) {
            nextState.splice(filterIndex, 1, { column: columnName, value: value });
        } else {
            nextState.push({ column: columnName, value: value })
        }
        return nextState;
    }
};

// UI
export class FilterState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            filters: props.defaultFilters || []
        };

        this.changeFilters = (filters) => {
            let { filtersChange } = this.props;
            this.setState({ filters });
            filtersChange && filtersChange(filters);
        };

        this._rows = memoize((rows, filters) => filterHelpers.filter(rows, filters))
    }
    render() {
        let filters = this.props.filters || this.state.filters;

        return (
            <div>
                <Action name="setColumnFilter" action={({ columnName, value }, getter) => {
                    this.changeFilters(filterHelpers.calcFilters({ columnName, value }, filters)); }} />

                <GetterExtender name="rows" value={(rows, getter) => (this._rows)(rows, filters)}/>

                <Getter name="filterFor" value={(getter, { columnName }) => filterHelpers.filterFor(columnName, filters)} />
            </div>
        )
    }
};