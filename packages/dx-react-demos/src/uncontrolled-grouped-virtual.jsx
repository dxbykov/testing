import React from 'react';
import {
    DataGrid,
    SortingState, SelectionState, FilterState, GroupingState,
    TableHeaderRow
} from '@devexpress/dx-react-datagrid';
import {
    TableColumnSelection, TableRowDetail, TableHeaderRowSorting, TableHeaderRowGrouping,
    VirtualTableView, TableFilterRow, GroupingPanel, TableGroupRow
} from '@devexpress/dx-react-datagrid-bootstrap3';

import { generateColumns, generateRows } from './demoData';

export class UncontrolledGroupedVirtualDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(20000),
        };

        this.rowTemplate = ({ row }) => <div>Detail for {row.name} from {row.city}</div>
    }
    render() {
        let { rows, columns } = this.state;

        return (
            <div style={{ width: '500px' }}>
                <h2>Uncontrolled Grouped Virtual Demo (20K rows)</h2>

                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <FilterState
                        defaultFilters={[{ column: 'car', value: 'au' }]}/>
                    <SortingState
                        defaultSortings={[{ column: 'name', direction: 'asc' }]}/>
                    <GroupingState
                        defaultGrouping={[{ column: 'sex' }]}
                        defaultExpandedGroups={{ 'Female': true }}/>

                    <SelectionState
                        defaultSelection={[1, 3, 18]}/>

                    <VirtualTableView/>
                    
                    <TableHeaderRow/>
                    <TableHeaderRowSorting/>
                    <TableHeaderRowGrouping/>

                    <TableFilterRow/>

                    <TableColumnSelection/>

                    <TableRowDetail
                        defaultExpanded={[3]}
                        template={this.rowTemplate}/>
                    
                    <TableGroupRow/>
                    <GroupingPanel />

                </DataGrid>
            </div>
        )
    }
};