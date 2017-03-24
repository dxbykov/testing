import React from 'react';
import { Getter, Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { GroupPanel } from '../components/group-panel.jsx';

export class Grouping extends React.PureComponent {
    constructor(props) {
        super(props);

        this._tableColumns = ({ tableColumns, grouping }) => {
            return [
                ...tableColumns.filter(column => grouping.findIndex(g => g.column === column.name) === -1)
            ]
        };
    }
    render() {
        return (
            <div>
                <Getter name="tableColumns"
                    pureComputed={this._tableColumns}
                    connectArgs={(getter) => ({
                        tableColumns: getter('tableColumns')(),
                        grouping: getter('grouping')()
                    })}/>

                <Template name="root">
                    <div> {/* TODO: Fiber remove */}
                        <TemplatePlaceholder name="group-panel" />
                        <TemplatePlaceholder />
                    </div>
                </Template>

                <Template
                    name="group-panel"
                    connectGetters={(getter) => ({
                        grouping: getter('grouping')()
                    })}
                    connectActions={(action) => ({
                        groupByColumn: ({ columnName, groupIndex }) => action('groupByColumn')({ columnName, groupIndex }),
                    })}>
                    <GroupPanel />
                </Template>
            </div>
        );
    }
}