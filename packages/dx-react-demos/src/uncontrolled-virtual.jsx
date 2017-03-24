import React from 'react';
import {
    DataGrid,
    SortingState, SelectionState, FilterState, PagingState,
    VirtualTableView, TableColumnSelection, TableRowDetail, TableHeaderRowSorting, TableFilterRow, TableHeaderRow,
    Paging
} from '@devexpress/dx-react-datagrid';

import { generateColumns, generateRows } from './demoData';

export class UncontrolledVirtualDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(200000),
        };

        this.rowTemplate = (row) => <div>Detail for {row.name} from {row.city}</div>
    }
    render() {
        let { rows, columns } = this.state;

        return (
            <div style={{ width: '500px' }}>
                <h2>Uncontrolled Virtual Demo</h2>

                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <FilterState
                        defaultFilters={[{ column: 'sex', value: 'fe' }]}/>
                    <SortingState
                        defaultSortings={[{ column: 'name', direction: 'asc' }]}/>

                    <SelectionState
                        defaultSelection={[1, 3, 18]}/>

                    <VirtualTableView/>
                    
                    <TableHeaderRow/>
                    <TableHeaderRowSorting/>

                    <TableFilterRow/>

                    <TableColumnSelection/>

                    <TableRowDetail
                        defaultExpanded={[3]}
                        template={this.rowTemplate}/>

                </DataGrid>
            </div>
        )
    }
};