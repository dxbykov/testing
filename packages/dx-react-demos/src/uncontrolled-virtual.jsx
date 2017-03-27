import React from 'react';
import {
    DataGrid,
    SortingState, SelectionState, FilteringState, PagingState,
    TableHeaderRow,
    Paging
} from '@devexpress/dx-react-datagrid';
import {
    VirtualTableView, TableFilterRow, TableColumnSelection, TableRowDetail, TableHeaderRowSorting
} from '@devexpress/dx-react-datagrid-bootstrap3';

import { generateColumns, generateRows } from './demoData';

export class UncontrolledVirtualDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(200000),
        };

        this.rowTemplate = ({ row }) => <div>Detail for {row.name} from {row.city}</div>
    }
    render() {
        let { rows, columns } = this.state;

        return (
            <div style={{ width: '500px' }}>
                <h2>Uncontrolled Virtual Demo (200K rows)</h2>

                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <FilteringState
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