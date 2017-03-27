import React from 'react';
import {
    DataGrid,
    SortingState, SelectionState, FilterState, PagingState, GroupingState,
    TableFilterRow, TableHeaderRow
} from '@devexpress/dx-react-datagrid';
import {
    TableView, TableRowDetail, TableHeaderRowSorting, TableHeaderRowGrouping,
    TableColumnSelection, Paging, Grouping, TableGroupRow
} from '@devexpress/dx-react-datagrid-bootstrap3';

import { generateColumns, generateRows } from './demoData';

export class FullFeaturedUncontrolledDemo extends React.PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            columns: generateColumns(),
            rows: generateRows(105),
        };

        this.rowTemplate = ({ row }) => <div>Detail for {row.name} from {row.city}</div>
    }
    render() {
        let { rows, columns } = this.state;

        return (
            <div style={{ width: '100%' }}>
                <h2>Full Featured Uncontrolled Demo</h2>

                <DataGrid
                    rows={rows}
                    columns={columns}>

                    <SortingState
                        defaultSortings={[{ column: 'name', direction: 'asc' }]}/>
                    
                    <FilterState
                        defaultFilters={[{ column: 'name', value: 'j' }]}/>
                    

                    <GroupingState
                        defaultGrouping={[ { column: 'sex' }/*, { column: 'city' }, { column: 'car' }*/ ]}
                        defaultExpandedGroups={{ 'Female': true }}
                        />

                    <PagingState
                        defaultPage={0}
                        pageSize={25} />

                    <SelectionState
                        defaultSelection={[1, 3, 18]}/>

                    <TableView/>
                    
                    <TableHeaderRow/>
                    <TableHeaderRowSorting/>
                    <TableHeaderRowGrouping/>

                    <TableFilterRow/>
                        
                    <Paging />

                    <TableColumnSelection/>

                    <TableRowDetail
                        defaultExpanded={[3]}
                        template={this.rowTemplate}/>

                    <TableGroupRow />

                    <Grouping />

                </DataGrid>
            </div>
        )
    }
};