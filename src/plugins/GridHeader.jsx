import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridHeaderView = ({ items }) => {
    return (
        <div className="grid-header">
            {items.map((Item, index) => <div key={index} className="grid-header-item"><Item /></div>)}
        </div>
    );
};

export class GridHeaderContainer extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        let { header } = this.context.gridHost.slots;

        return (
            header && <GridHeaderView items={header}></GridHeaderView>
        )
    }
};

GridHeaderContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}

export const gridHeaderPlugin = () => {
    return {
        components: {
            GridHeader: original => GridHeaderContainer
        },
        slots: {
            header: original => {
                return original || [];
            } //what to do in case of collision with other plugin
        }
    };
}

export default asPluginComponent(gridHeaderPlugin);