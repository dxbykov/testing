import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridGroupPanelView = () => {
    return (
        <div className="grid-group-panel">
            Hi! I'm a group panel!
        </div>
    );
};

export class GridGroupPanelContainer extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <GridGroupPanelView></GridGroupPanelView>
        )
    }
};

GridGroupPanelContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export const gridGroupPanelPlugin = (config) => {
    let targetSlot = config.slot || 'header';

    let result = {
        slots: {
            [targetSlot]: original => {
                let target = original || [];
                target.push(GridGroupPanelContainer);
                return target;
            }
        }
    };

    return result;
}

export default asPluginComponent(gridGroupPanelPlugin);