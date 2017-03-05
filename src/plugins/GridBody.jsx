import React from 'react';

import { asPluginComponent, connectIoC } from './pluggable';

export const GridBodyView = ({ items }) => {
    return (
        <div className="grid-body">
            {items.map((Item, index) => <div key={index} className="grid-body-item"><Item /></div>)}
        </div>
    );
};

const selectIocProps = ioc => {
  let { slots } = ioc;
  return {
    items: slots.bodySlot
  }
}

let GridBody = connectIoC(GridBodyView, selectIocProps);

let bodySlot = original => (original || []);

export const gridBodyPlugin = () => {
    return {
        components: {
            GridBody: () => GridBody
        },
        slots: {
            bodySlot: bodySlot
        }
    };
}

export default asPluginComponent(gridBodyPlugin);