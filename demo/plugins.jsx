import React from 'react';
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
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
import GridEditColumn from '../src/plugins/Editing/GridEditColumn';
import GridEditState from '../src/plugins/Editing/GridEditState';
import GridEditRow from '../src/plugins/Editing/GridEditRow';

import { connectIoC } from '../src/plugins/pluggable';

import './plugins.css';

/* Grid */

class GridRoot extends React.Component {
    constructor(props, context) {
        super(props, context);
    }
    componentWillMount() {
        let { reducers } = this.props;
        let { stateStore } = this.context;

        let pluginReducer = (state, action) => {
            Object.keys(reducers).forEach(key => {
                state = reducers[key](state, action);
            });
            return state;
        };

        stateStore.replaceReducer(pluginReducer);
    }
    render() {
        let { stateStore } = this.context;
        return <Provider store={stateStore}>
            <this.props.GridLayout />
        </Provider>
    }
}
GridRoot.contextTypes = {
    stateStore: React.PropTypes.object.isRequired,
};
GridRoot = connectIoC(GridRoot, ioc => {
    return {
        GridLayout: ioc.components.GridLayout,
        reducers: ioc.reducers 
    };
});


export class Grid extends React.Component {
    constructor(props) {
        super(props);

        this.host = {
            selectors: {
                propsSelector: state => this.props
            },
            reducers: {}
        };
    }
    getChildContext() {
        return {
            gridHost: this.host,
            stateStore: createStore((state = {}) => state, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
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
    stateStore: React.PropTypes.object.isRequired,
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
                <GridBody />
                <GridTableView />
                <GridDataRow />

                <GridHeaderRow />
                <GridHeaderRowSorting />

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
                <GridBody />
                <GridTableView />
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
                <h1>Default Separate Grid Config</h1>
                <Grid rows={rows}>
                    <DefaultGridConfig />
                    <GridAutoColumns />
                </Grid>

                <h1>Inline Plugins Declaration</h1>
                <Grid rows={rows}>
                    <Plugins>
                        <GridCore />
                        <GridLayout />
                        <GridHeader />
                        <GridBody />

                        <GridGroupPanel />
                        <GridTableView />
                        <GridDataRow />

                        <GridAutoColumns />

                        <GridHeaderRow />

                        <GridSortingState />
                        <GridHeaderRowSorting />

                        <GridEditColumn position="left" />
                        <GridEditState />
                        <GridEditRow />

                    </Plugins>
                </Grid>

                <h1>Custom Separate Grid Config</h1>
                <Grid
                    rows={rows}
                    columns={[{ field: 'id' }, { field: 'name' }]}>
                    <CustomGridConfig />
                </Grid>
            </div>
        )
    }
};