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

export class GridTableViewContainer extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        let { rowsSelector, columnsSelector } = this.context.gridHost.selectors;
        let { renderRow } = this.context.gridHost.components;
        let rows = rowsSelector();
        let columns = columnsSelector();
        return (
            <GridTableViewView>
                {rows.map((row, key) => renderRow({row, columns, key, components: this.context.gridHost.components}))}
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
        components: {
            renderRow: original => (rowContext) => original && original(rowContext) || null
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
