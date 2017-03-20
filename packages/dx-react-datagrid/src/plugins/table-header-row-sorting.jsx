import React from 'react';
import { Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';
import { SortableCell } from '../components/sortable-cell.jsx';

export class TableHeaderRowSorting extends React.PureComponent {
    render() {
        return (
            <div>
                <Template
                    name="tableViewCell"
                    predicate={({ column, row }) => row.type === 'heading' && !column.type}
                    connectGetters={(getter, { column }) => ({
                        direction: getter('sortingFor')({ columnName: column.name }),
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