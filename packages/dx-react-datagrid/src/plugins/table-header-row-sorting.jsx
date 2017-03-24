import React from 'react';
import { Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { sortingDirectionForColumn } from './sorting-state.jsx';

export class TableHeaderRowSorting extends React.PureComponent {
    render() {
        const SortableCell = this.props.sortableCellTemplate;

        return (
            <div>
                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'heading' && !column.type}
                    connectGetters={(getter, { column }) => ({
                        direction: sortingDirectionForColumn(column.name, getter('sortings')()),
                    })}
                    connectActions={(action, { column }) => ({
                        changeDirection: () => action('applySorting')({ columnName: column.name }),
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