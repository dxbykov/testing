import React from 'react';

import { asPluginComponent, connectIoC } from './pluggable';

export const GridLayoutView = ({ header, body }) => {
    let GridHeader = header,
        GridBody = body;

    return (
        <div className="grid-layout">
            { GridHeader ? <div className="grid-header-container"><GridHeader /></div> : null }
            { GridBody ? <div className="grid-body"><GridBody /></div> : null }
        </div>
    );
};

const selectIocProps = ioc => {
  let { components } = ioc;
  return {
    header: components.GridHeader,
    body: components.GridBody
  }
}

let GridLayout = connectIoC(GridLayoutView, selectIocProps);

// const selectProps = (selectors) => {
//   return {
//       ...
//   }
// }

// const selectActions = (actions) => {
//   return {
//     onClick: (args) => actions.onSort(args.id)
//   }
// }

//GridLayout = connectState(GridLayoutView, selectProps, selectActions);

export const gridLayoutPlugin = () => {
    return {
        components: {
            GridLayout: () => GridLayout
        }
    };
}

export default asPluginComponent(gridLayoutPlugin);