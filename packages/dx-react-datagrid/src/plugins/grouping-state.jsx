import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';

// Core
const groupHelpers = {
    groupByColumn: (prevGrouping, { columnName, groupIndex }) => {
        let grouping = prevGrouping.slice(),
            index = grouping.findIndex(g => g.column === columnName);

        if(index > -1) {
            grouping.splice(index, 1);
        }
        else {
            groupIndex = groupIndex || grouping.length;
        }
        
        if(groupIndex > -1) {
            grouping.splice(groupIndex, 0, {
                column: columnName
            });
        }
        
        return grouping;
    },
    groupRows: (originalRows, grouping, parentGroup) => {
        if(!grouping.length) return originalRows;

        let rows = originalRows.slice(),
            groupColumn = grouping[0].column,
            nextGrouping = grouping.slice(1),
            result = [],
            groups = [],
            groupHash = {};

        originalRows.forEach(r => {
            let groupKey = r[groupColumn],
                group;

            if(groupKey in groupHash) {
                group = groupHash[groupKey];
            }
            else {
                group = groupHash[groupKey] = {
                    key: (parentGroup ? parentGroup.key + '_' : '') + groupKey,
                    colspan: (parentGroup ? parentGroup.colspan + 1 : 0),
                    value: groupKey,
                    type: 'groupRow',
                    column: groupColumn,
                    rows: [],
                };
                if(parentGroup) {
                    group._parentRow = parentGroup;
                }
                groups.push(group);
            }

            group.rows.push(Object.assign({}, r, { _parentRow: group }));
        });

        if(nextGrouping.length) {
            groups.forEach(group => {
                group.rows = groupHelpers.groupRows(group.rows, nextGrouping, group);
            });
        }

        return groups;
    },
    expand: (rows, expanded) => {
        let result = rows.slice().map(row => {
            if(row.type === 'groupRow' && expanded[row.key]) {
                return [
                    row,
                    ...groupHelpers.expand(row.rows, expanded)
                ];
            }
            return [ row ];
        }).reduce((acc, val) => acc.concat(val), []);

        return result;
    }
};

// UI
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

        this.groupByColumn = ({ columnName, groupIndex }) => {
            let prevGrouping = this.props.grouping || this.state.grouping;
            let { groupingChange } = this.props;

            let grouping = groupHelpers.groupByColumn(prevGrouping, { columnName, groupIndex });

            this.setState({ grouping });
            groupingChange && groupingChange(expandedGroups);
        };
    }
    render() {
        let grouping = this.props.grouping || this.state.grouping;
        let expandedGroups = this.props.expandedGroups || this.state.expandedGroups;

        return (
            <div>
                <Action name="toggleGroupExpanded" action={({ groupKey }) => { this.toggleGroupExpanded(groupKey); }} />
                <Action name="groupByColumn" action={({ columnName, groupIndex }) => { this.groupByColumn({ columnName, groupIndex }); }} />

                <Getter name="rows"
                    pureComputed={({ rows, grouping }) => groupHelpers.groupRows(rows, grouping)}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        grouping
                    })}/>

                <Getter name="rows"
                    pureComputed={({ rows, expandedGroups }) => groupHelpers.expand(rows, expandedGroups)}
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