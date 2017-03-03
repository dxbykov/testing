import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridTableViewView = ({ children }) => {
    return (
        <table className="grid-table-view">
            <tbody>
            {children}
            </tbody>
        </table>
    );
};

export class GridTableViewContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let { tableRowsSelector, columnsSelector } = this.context.gridHost.selectors;
        let { renderRow } = this.context.gridHost.components;
        let rows = tableRowsSelector();
        let columns = columnsSelector();
        return (
            <GridTableViewView>
                {rows.map((row, key) => renderRow({row, columns, key}))}
            </GridTableViewView>
        )
    }
};

GridTableViewContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export const gridTableViewPlugin = (config) => {
    let targetSlot = config.slot || 'body';

    let result = {
        selectors: {
            tableRowsSelector: (original, host) => () => host.selectors.rowsSelector()
        },
        components: {
            renderRow: (original, host) => (rowContext) => original && original(rowContext) || null
        },
        slots: {
            [targetSlot]: original => {
                let target = original || [];
                target.push(GridTableViewContainer);
                return target;
            }
        }
    };

    return result;
}

export default asPluginComponent(gridTableViewPlugin);
