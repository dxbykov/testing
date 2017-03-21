import React from 'react';
import { Getter, GetterExtender, Action } from '@devexpress/dx-react-core';
import memoize from '../utils/memoize.js';

const selectionHelpers = {
    calcSelection: (prevSelection, row, getRowId) => {
        let selectedRows = prevSelection.slice(),
            rowId = getRowId(row),
            selectedIndex = selectedRows.indexOf(rowId);
        
        if(selectedIndex > -1) {
            selectedRows.splice(selectedIndex, 1);
        } else if (selectedIndex === -1) {
            selectedRows.push(rowId)
        }

        return selectedRows;
    },
    toggleSelectAll: (prevSelection, rows, getRowId) => {
        if(prevSelection.length === rows.length) {
            return [];
        } else {
            return rows.map(getRowId);
        }
    },
};

// UI
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
                <Action name="toggleRowSelection" action={({ row }) =>
                    this.changeSelection(selectionHelpers.calcSelection(selection, row, (row) => row.id))} />
                <Action name="toggleAllSelection" action={({ rows }) =>
                    this.changeSelection(selectionHelpers.toggleSelectAll(selection, rows, (row) => row.id))} />

                <Getter name="selection" value={() => selection} />
            </div>
        )
    }
};