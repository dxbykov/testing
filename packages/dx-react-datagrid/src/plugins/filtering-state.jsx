import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';
import { filteredRows, setColumnFilter } from '@devexpress/dx-datagrid-core';

export class FilteringState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            filters: props.defaultFilters || []
        };

        this._setColumnFilter = (filters, { columnName, value }) => {
            let { filtersChange } = this.props;
            let nextFilters = setColumnFilter(filters, { columnName, value });
            this.setState({ nextFilters });
            filtersChange && filtersChange(nextFilters);
        };

        this._filteredRows = ({ rows, filters }) => filteredRows(rows, filters)
    }
    render() {
        let filters = this.props.filters || this.state.filters;

        return (
            <div>
                <Action name="setColumnFilter" action={({ columnName, value }) => this._setColumnFilter(filters, { columnName, value }) } />

                <Getter name="rows"
                    pureComputed={this._filteredRows}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        filters
                    })}/>

                <Getter name="filters" value={filters} />
            </div>
        )
    }
};