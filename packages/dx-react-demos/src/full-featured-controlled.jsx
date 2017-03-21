import React from 'react';
import {
    DataGrid,
    SortingState, SelectionState, FilterState,
    TableView, TableColumnSelection, TableRowDetail, TableHeaderRowSorting, TableFilterRow, TableHeaderRow
} from '@devexpress/dx-react-datagrid';

import { generateColumns, generateRows } from './demoData';

export class FullFeaturedControlledDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(20),
            sortings: [{ column: 'id', direction: 'asc' }],
            selection: [1, 3, 18],
            expandedRows: [3],
            filters: []
        };

        this.changeExpandedRows = (expandedRows) => this.setState({ expandedRows });
        this.changeSelection = (selection) => this.setState({ selection });
        this.changeSortings = (sortings) => this.setState({ sortings });
        this.changeFilters = (filters) => this.setState({ filters });
        this.rowTemplate = (row) => <div>Detail for {row.name} from {row.city}</div>
    }
    render() {
        let { rows, columns, sortings, selection, expandedRows, filters } = this.state;

        return (
            <div>
                <h2>Full Featured Controlled Demo</h2>

                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <SortingState
                        sortings={sortings}
                        sortingsChange={this.changeSortings}/>
                    <FilterState
                        filters={filters}
                        filtersChange={this.changeFilters}/>
                    <SelectionState
                        selection={selection}
                        selectionChange={this.changeSelection}/>

                    <TableView/>

                    <TableHeaderRow/>
                    <TableHeaderRowSorting/>

                    <TableFilterRow/>

                    <TableColumnSelection/>

                    <TableRowDetail
                        expanded={expandedRows}
                        expandedChange={this.changeExpandedRows}
                        template={this.rowTemplate}/>

                </DataGrid>
            </div>
        )
    }
};