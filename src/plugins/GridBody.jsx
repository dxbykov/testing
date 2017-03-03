import React from 'react';

export const GridBodyView = ({ items }) => {
    return (
        <div className="grid-body">
            {items.map((Item, index) => <div key={index} className="grid-body-item"><Item /></div>)}
        </div>
    );
};

export class GridBodyContainer extends React.PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        let { body } = this.context.gridHost.slots;

        return (
            body && <GridBodyView items={body}></GridBodyView>
        )
    }
};

GridBodyContainer.contextTypes = {
    gridHost: React.PropTypes.object.isRequired
}

const gridBodyPlugin = {
    components: {
        GridBody: original => GridBodyContainer
    },
    slots: {
        body: original => {
            return original || [];
        }
    }
}

export default gridBodyPlugin;