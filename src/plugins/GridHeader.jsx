import React from 'react';

import { asPluginComponent, connectIoC } from './pluggable';

export const GridHeaderView = ({ items }) => {
    return (
        <div className="grid-header">
            {items.map((Item, index) => <div key={index} className="grid-header-item"><Item /></div>)}
        </div>
    );
};

const selectIocProps = ioc => {
  let { slots } = ioc;
  return {
    items: slots.headerSlot
  }
}

let GridHeader = connectIoC(GridHeaderView, selectIocProps);

let headerSlot = original => (original || []);

export const gridHeaderPlugin = () => {
    return {
        components: {
            GridHeader: original => GridHeader
        },
        slots: {
            headerSlot: headerSlot
        }
    };
}

export default asPluginComponent(gridHeaderPlugin);