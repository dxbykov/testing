import React from 'react';
import {
    DataGrid,
    SortingState, SelectionState, FilterState, PagingState,
    TableView, TableColumnSelection, TableRowDetail, TableHeaderRowSorting, TableFilterRow, TableHeaderRow,
    Paging
} from '@devexpress/dx-react-datagrid';

import { generateColumns, generateRows } from './demoData';

export class FullFeaturedUncontrolledDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(105),
        };

        this.rowTemplate = (row) => <div>Detail for {row.name} from {row.city}</div>
    }
    render() {
        let { rows, columns } = this.state;

        return (
            <div>
                <h2>Full Featured Uncontrolled Demo</h2>

                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <SortingState
                        defaultSortings={[{ column: 'name', direction: 'asc' }]}/>
                    <FilterState
                        defaultFilters={[{ column: 'sex', value: 'fe' }]}/>
                    <PagingState
                        defaultPage={2}
                        pageSize={20} />
                    <SelectionState
                        defaultSelection={[1, 3, 18]}/>

                    <TableView/>
                    
                    <TableHeaderRow/>
                    <TableHeaderRowSorting/>

                    <TableFilterRow/>

                    <TableColumnSelection/>

                    <TableRowDetail
                        defaultExpanded={[3]}
                        template={this.rowTemplate}/>

                    <Paging />

                </DataGrid>
            </div>
        )
    }
};