import React from 'react';
import { Getter, GetterExtender, Action } from '@devexpress/dx-react-core';
import { setRowSelection, toggleSelectAll } from '@devexpress/dx-datagrid-core';

export class SelectionState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selection: props.defaultSelection || []
        };

        this.changeSelection = (selection) => {
            let { selectionChange } = this.props;
            this.setState({ selection });
            selectionChange && selectionChange(selection);
        };
    }
    render() {
        let selection = this.props.selection || this.state.selection;
        
        return (
            <div>
                <Action name="setRowSelection" action={({ row }) =>
                    this.changeSelection(setRowSelection(selection, { rowId: row.id }))} />
                <Action name="toggleAllSelection" action={({ rows }) =>
                    this.changeSelection(toggleSelectAll(selection, { rows, getRowId: row => row.id }))} />

                <Getter name="selection" value={selection} />
            </div>
        )
    }
};