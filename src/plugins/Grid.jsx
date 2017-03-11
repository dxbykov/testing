import React from 'react';
import { createStore } from 'redux';
import { combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { connectIoC } from './pluggable';

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


export default class Grid extends React.PureComponent {
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
