import React from 'react';
import { Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { getColumnSortingDirection } from '@devexpress/dx-datagrid-core';

export class TableHeaderRowSorting extends React.PureComponent {
    render() {
        const SortableCell = this.props.sortableCellTemplate;

        return (
            <div>
                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'heading' && !column.type}
                    connectGetters={(getter, { column }) => ({
                        direction: getColumnSortingDirection(getter('sortings')(), column.name),
                    })}
                    connectActions={(action, { column }) => ({
                        changeDirection: ({ keepOther }) => action('setColumnSorting')({ columnName: column.name, keepOther }),
                    })}>
                    {({ direction, changeDirection }) => (
                        <SortableCell direction={direction} changeDirection={changeDirection}>
                            <TemplatePlaceholder />
                        </SortableCell>
                    )}
                </Template>
            </div>
        )
    }
};