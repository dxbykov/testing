import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';
import { groupByColumn, groupedRows, expandedGroupRows } from '@devexpress/dx-datagrid-core';

export class GroupingState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            grouping: props.defaultGrouping || [],
            expandedGroups: props.defaultExpandedGroups || {},
        };

        this.toggleGroupExpanded = (groupKey) => {
            let prevExpandedGroups = this.props.expandedGroups || this.state.expandedGroups;
            let { expandedGroupsChange } = this.props;

            let expandedGroups = Object.assign({}, prevExpandedGroups);
            if(expandedGroups[groupKey]) {
                delete expandedGroups[groupKey];
            }
            else {
                expandedGroups[groupKey] = true;
            }

            this.setState({ expandedGroups });
            expandedGroupsChange && expandedGroupsChange(expandedGroups);
        };

        this._groupByColumn = (prevGrouping, { columnName, groupIndex }) => {
            let { groupingChange } = this.props;
            let grouping = groupByColumn(prevGrouping, { columnName, groupIndex });
            this.setState({ grouping });
            groupingChange && groupingChange(grouping);
        };
    }
    render() {
        let grouping = this.props.grouping || this.state.grouping;
        let expandedGroups = this.props.expandedGroups || this.state.expandedGroups;

        return (
            <div>
                <Action name="toggleGroupExpanded" action={({ groupKey }) => { this.toggleGroupExpanded(groupKey); }} />
                <Action name="groupByColumn" action={({ columnName, groupIndex }) => { this._groupByColumn(grouping, { columnName, groupIndex }); }} />

                <Getter name="rows"
                    pureComputed={({ rows, grouping }) => groupedRows(rows, grouping)}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        grouping
                    })}/>

                <Getter name="rows"
                    pureComputed={({ rows, expandedGroups }) => expandedGroupRows(rows, expandedGroups)}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        expandedGroups
                    })}/>

                <Getter name="grouping" value={grouping} />
                <Getter name="expandedGroups" value={expandedGroups} />
            </div>
        )
    }
};