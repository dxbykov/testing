import React from 'react';
import { Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { GroupableCell } from '../components/groupable-cell.jsx';

export class TableHeaderRowGrouping extends React.PureComponent {
    render() {
        return (
            <div>
                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'heading' && !column.type}
                    connectActions={(action, { column }) => ({
                        groupByColumn: () => action('groupByColumn')({ columnName: column.name })
                    })}>
                    {({ groupByColumn }) => (
                        <GroupableCell groupByColumn={groupByColumn}>
                            <TemplatePlaceholder />
                        </GroupableCell>
                    )}
                </Template>
            </div>
        )
    }
};