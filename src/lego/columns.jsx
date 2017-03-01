import React from 'react';

import { ColumnProvider } from './grid';
import { DetailCell, SelectableCell } from './cells';

export class DetailColumnProvider extends React.Component {
    render() {
        let { isExpanded, toggleExpanded } = this.props;
        
        return (
            <ColumnProvider
                predicate={({ column }) => column.type === 'detail'}
                width={() => 40}
                template={({ rowIndex, row }) => (
                    <DetailCell
                        expanded={isExpanded({ rowIndex, row })}
                        expandedChange={() => toggleExpanded({ rowIndex, row })}/>
                )}/>
        );
    }
};

export class SelectableColumnProvider extends React.Component {
    render() {
        let { isSelected, selectedChange } = this.props;
        
        return (
            <ColumnProvider
                predicate={({ column }) => column.type === 'select'}
                width={() => 40}
                template={({ row }) => (
                    <SelectableCell
                        selected={isSelected(row.id)}
                        selectedChange={() => selectedChange(row.id)}
                        style={{ borderBottom: '1px dotted black' }}/>
                )}/>
        );
    }
};