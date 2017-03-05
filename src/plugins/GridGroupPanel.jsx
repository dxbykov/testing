import React from 'react';

import { asPluginComponent } from './pluggable';

export const GridGroupPanelView = () => {
    return (
        <div className="grid-group-panel">
            Hi! I'm a group panel!
        </div>
    );
};


export const gridGroupPanelPlugin = (config) => {
    let targetSlot = config.slot || 'headerSlot';

    let result = {
        slots: {
            [targetSlot]: original => {
                let target = original || [];
                target.push(GridGroupPanelView);
                return target;
            }
        }
    };

    return result;
}

export default asPluginComponent(gridGroupPanelPlugin);