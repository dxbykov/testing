import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';
import { sortedRows, setColumnSorting } from '@devexpress/dx-datagrid-core';

export class SortingState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            sortings: props.defaultSortings || []
        };

        this._setColumnSorting = (sortings, { columnName, direction, keepOther }) => {
            let { sortingsChange } = this.props;
            let nextSortings = setColumnSorting(sortings, { columnName, direction, keepOther });
            this.setState({ sortings: nextSortings });
            sortingsChange && sortingsChange(nextSortings);
        };

        this._sortedRows = ({ rows, sortings }) => sortedRows(rows, sortings);
    }
    render() {
        let sortings = this.props.sortings || this.state.sortings;
        
        return (
            <div>
                <Action
                    name="setColumnSorting"
                    action={(
                        ({ columnName, direction, keepOther }) => this._setColumnSorting(sortings, { columnName, direction, keepOther })
                    )} />

                <Getter name="rows"
                    pureComputed={this._sortedRows}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        sortings
                    })}/>

                <Getter name="sortings" value={sortings} />
            </div>
        )
    }
};