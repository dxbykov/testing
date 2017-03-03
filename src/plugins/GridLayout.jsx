import React from 'react';

import { asPluginComponent } from './pluggable';

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

export class GridLayoutContainer extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        let { data } = this.props;
        let { GridHeader, GridBody } = this.context.gridHost.components;

        return (
            <GridLayoutView header={GridHeader} body={GridBody}></GridLayoutView>
        )
    }
};

GridLayoutContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export const gridLayoutPlugin = () => {
    return {
        components: {
            GridLayout: original => GridLayoutContainer
        }
    };
}

export default asPluginComponent(gridLayoutPlugin);