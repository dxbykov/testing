import React from 'react';
import {
    DataGrid,
    SortingState, SelectionState, FilterState, PagingState,
    TableFilterRow, TableHeaderRow
} from '@devexpress/dx-react-datagrid';

import {
    TableView, TableRowDetail, TableHeaderRowSorting,
    TableColumnSelection, Paging
} from '@devexpress/dx-react-datagrid-bootstrap3';

import { generateColumns, generateRows } from './demoData';

export class FullFeaturedControlledDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(105),
            sortings: [{ column: 'id', direction: 'asc' }],
            selection: [1, 3, 18],
            expandedRows: [3],
            filters: [],
            page: 0
        };

        this.changeExpandedRows = (expandedRows) => this.setState({ expandedRows });
        this.changeSelection = (selection) => this.setState({ selection });
        this.changeSortings = (sortings) => this.setState({ sortings });
        this.changeFilters = (filters) => this.setState({ filters });
        this.changePage = (page) => this.setState({ page });
        this.rowTemplate = (row) => <div>Detail for {row.name} from {row.city}</div>
    }
    render() {
        let { rows, columns, sortings, selection, expandedRows, filters, page } = this.state;

        return (
            <div style={{ width: '100%' }}>
                <h2>Full Featured Controlled Demo</h2>

                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <FilterState
                        filters={filters}
                        filtersChange={this.changeFilters}/>
                    <SortingState
                        sortings={sortings}
                        sortingsChange={this.changeSortings}/>
                    <PagingState
                        page={page}
                        onPageChange={this.changePage}
                        pageSize={20} />

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

                    <Paging />

                </DataGrid>
            </div>
        )
    }
};