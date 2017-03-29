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
            this.setState({ filters: nextFilters });
            filtersChange && filtersChange(nextFilters);
        };
    }
    render() {
        let filters = this.props.filters || this.state.filters;

        return (
            <div>
                <Action name="setColumnFilter" action={({ columnName, value }) => this._setColumnFilter(filters, { columnName, value }) } />

                <Getter name="rows"
                    pureComputed={filteredRows}
                    connectArgs={(getter) => [
                        getter('rows')(),
                        filters
                    ]}/>

                <Getter name="filters" value={filters} />
            </div>
        )
    }
};
