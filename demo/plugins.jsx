import React from 'react';
import './magic.css';
import { generateColumns, generateRows } from './demoData';
import GridLayout from '../src/plugins/GridLayout';
import GridHeader from '../src/plugins/GridHeader';
import GridGroupPanel from '../src/plugins/GridGroupPanel';
import GridBody from '../src/plugins/GridBody';
import GridTableView from '../src/plugins/GridTableView';
import GridAutoColumns from '../src/plugins/GridAutoColumns';
import GridHeaderRow from '../src/plugins/GridHeaderRow';
import GridCore from '../src/plugins/GridCore';
import GridDataRow from '../src/plugins/GridDataRow';
import GridHeaderRowSorting from '../src/plugins/Sorting/GridHeaderSorting';
import GridSortingState from '../src/plugins/Sorting/GridSortingState';

import './plugins.css';

/* Grid */

class GridRoot extends React.Component {
    render() {
        const { GridLayout } = this.context.gridHost.components;
        return <GridLayout />
    }
}
GridRoot.contextTypes = {
    gridHost: React.PropTypes.object.isRequired,
}

export class Grid extends React.Component {
    constructor(props) {
        super(props);

        this.host = {
            dispatch: this.dispatch.bind(this),
            selectors: {
                stateSelector: () => this.state,
                propsSelector: () => this.props
            }
        };

        this.state = {};
    }
    dispatch(action) {
        console.log(action);
        this.setState(this.host.reducers[action.type](this.state, action));
    }
    getChildContext() {
        return {
            gridHost: this.host
        }
    }
    render() {
        return <div>{this.props.children}<GridRoot /></div>
    }
};
Grid.propTypes = {
    rows: React.PropTypes.array.isRequired,
    gridHost: React.PropTypes.object,
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};
/* End of Grid */

class Plugins extends React.Component {
    render() {
        return <div style={{display: 'none'}}>{this.props.children}</div>;
    }
}

class DefaultGridConfig extends React.Component {
    render() {
        return (
            <Plugins>
                <GridCore />
                <GridLayout />
                <GridHeader />
                <GridGroupPanel />
                <GridBody />
                <GridTableView />
                <GridHeaderRow />
                <GridHeaderRowSorting />
                <GridDataRow />

                <GridSortingState />
            </Plugins>
        );
    }
}

class CustomGridConfig extends React.Component {
    render() {
        return (
            <Plugins>
                <GridCore />
                <GridLayout />
                <GridHeader />
                <GridGroupPanel slot="body" />
                <GridBody />
                <GridTableView slot="header" />
                <GridDataRow />
            </Plugins>
        );
    }
}

export class PluginsDemo extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            rows: generateRows(5)
        }
    }

    render() {
        let { rows } = this.state;

        return (
            <div>
                <Grid rows={rows}>
                    <DefaultGridConfig />
                    <GridAutoColumns />
                </Grid>

                <Grid
                    rows={rows}
                    columns={['id','name']}>
                    <CustomGridConfig />
                </Grid>
            </div>
        )
    }
};