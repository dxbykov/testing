import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { connectIoC } from './pluggable';
import PluginGroup from './PluginGroup';
import GridCore from './GridCore';
import GridLayout from './GridLayout';
import GridBody from './GridBody';
import GridTableView from './TableView/GridTableView';
import GridDataRow from './GridDataRow';
import GridHeaderRow from './GridHeaderRow';
import GridAutoColumns from './GridAutoColumns';

class GridRoot extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
    }
    componentWillMount() {
        let { reducers } = this.props;
        let { stateStore } = this.context;

        let toCombine = {};
        Object.keys(reducers).forEach(key => {
            toCombine[key] = reducers[key]
        });
        let pluginReducer = combineReducers(toCombine);
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

class DefaultGridConfig extends React.PureComponent {
    render() {
        return (
            <PluginGroup>
                <GridCore />
                <GridLayout />
                <GridBody />
                <GridTableView />
                <GridDataRow />
                <GridHeaderRow />
                <GridAutoColumns />
            </PluginGroup>
        );
    }
}

const createPluginEventsMiddleware = host => {
    return function firePluginEvents({ getState }) {
        let { events } = host;
        return next => action => {
            let { [action.type]: handler } = events;
            if(handler) {
                handler(action);
            }
            return next(action)
        }
    }
};

export default class Grid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.host = {
            components: {},
            selectors: {
                rootPropsSelector: state => this.props
            },
            actionCreators: {},
            reducers: {
                forceUpdate: (state = {}, action) => action.type === 'FORCE_UPDATE' ? {} : state
            },
            events: {},
            forcePluginsUpdate: () => {
                this.stateStore.dispatch({ type: 'FORCE_UPDATE' });
            }
        };

        this.stateStore = createStore(
            (state = {}) => state,
            compose(
                applyMiddleware(
                    createPluginEventsMiddleware(this.host)
                ),
                window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
            )
        );

    }
    getChildContext() {
        return {
            gridHost: this.host,
            stateStore: this.stateStore
        }
    }
    render() {
        return <div><DefaultGridConfig />{this.props.children}<GridRoot /></div>
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
