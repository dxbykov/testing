import React from 'react';
import { connect } from 'react-redux';
import { asPluginComponent, connectIoC } from '../pluggable';

const GridGroupItemView = ({ group }) => {
    return (
        <span className="grid-group-item">
            { group.field }
        </span>
    );
};

const GridGroupPanelView = ({ groups, GridGroupItem }) => {
    return (
        <div className="grid-group-panel">
            {groups.map(group => <GridGroupItem key={group.field} group={group} />)}
        </div>
    );
};

const GridGroupPanelController = connectIoC(
    connect(
        (state, props) => ({
            groups: props.columnsSelector(state).filter(column => state.groups.indexOf(column.field) !== -1)
        }),
        (dispatch, props) => ({})
    )(GridGroupPanelView),
    ioc => ({
        columnsSelector: ioc.selectors.columnsSelector,
        GridGroupItem: ioc.components.GridGroupItem
    })
)

export default asPluginComponent((config) => {
    let targetSlot = config.slot || 'headerSlot';

    let result = {
        components: {
            GridGroupItem: (original) => (props) => <GridGroupItemView {...props}></GridGroupItemView>,
            GridGroupPanel: (original) => (props) => <GridGroupPanelController {...props}></GridGroupPanelController>
        },
        slots: {
            [targetSlot]: (original, host) => () => {
                let target = original() || [];
                let view = host.components.GridGroupPanel;
                target.push(view);
                return target;
            }
        }
    };

    return result;
});