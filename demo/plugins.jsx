import React from 'react';
import './magic.css';
import { generateColumns, generateRows } from './demoData';
import gridLayoutPlugin from '../src/plugins/GridLayout';
import gridHeaderPlugin from '../src/plugins/GridHeader';
import gridGroupPanelPlugin from '../src/plugins/GridGroupPanel';
import gridBodyPlugin from '../src/plugins/GridBody';
import gridTableViewPlugin from '../src/plugins/GridTableView';
import gridAutoColumnsPlugin from '../src/plugins/GridAutoColumns';
import gridHeaderRowPlugin from '../src/plugins/GridHeaderRow';
import gridCorePlugin from '../src/plugins/GridCore';
import gridDataRowPlugin from '../src/plugins/GridDataRow';

import './plugins.css';

/* Grid */

export class Grid extends React.Component {
    constructor(props) {
        super(props);

        this.host = {};

        Object.keys(this.props.gridHost).forEach(key => {
            this.host[key] = Object.assign({}, this.props.gridHost[key]);// use context or create new
        });
        
        this.state = this.enhanceInitialState({});
        this.enhanceSelectors();
    }
    enhanceInitialState(initialState) {
        let { reducers } = this.host;
        Object.keys(reducers).forEach(key => {
            initialState = reducers[key](initialState)
        });
        return initialState;
    }
    enhanceSelectors() {
        let { selectors } = this.host;
        Object.keys(selectors).forEach(key => {
            let selector = selectors[key];
            selectors[key] =  () => selector(this.state, this.props, selectors);
        });
    }
    getChildContext() {
        return {
            gridHost: this.host
        }
    }
    render() {
        const { GridLayout } = this.host.components
        return <div><GridLayout /></div>
    }
};
Grid.propTypes = {
    rows: React.PropTypes.array.isRequired,
    plugins: React.PropTypes.array.isRequired,
    gridHost: React.PropTypes.object.isRequired,
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.object.isRequired,
};
/* End of Grid */

/* Plugins Configuration */

let plugins = [
        gridCorePlugin,
        gridLayoutPlugin,
        gridHeaderPlugin,
        gridGroupPanelPlugin({ slot: 'header' }),
        gridBodyPlugin,
        gridTableViewPlugin({ slot: 'body' }),
        gridHeaderRowPlugin,
        gridAutoColumnsPlugin,
        gridDataRowPlugin
    ];

function applyPlugins(plugins) {
    let result = {};

    ['components', 'slots', 'reducers', 'selectors'].forEach(extensionType => {
        result[extensionType] = {};
        plugins.forEach(plugin => {
            if(plugin[extensionType]) {
                Object.keys(plugin[extensionType]).forEach(key => {
                    let original = result[extensionType][key],
                        enhancer = plugin[extensionType][key];

                    result[extensionType][key] = enhancer(original);
                });
            }
        });
    });

    return result;
}

let defaultGridConfig = applyPlugins(plugins);

/* End of Plugins Configuration */

export class PluginsDemo extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            rows: generateRows(20)
        }

        let r = generateRows(20);
        setTimeout(() => {
            this.setState({rows: r});
        }, 3000);
    }

    render() {
        let { rows } = this.state;

        return (
            <div>
                <Grid
                    rows={rows}
                    gridHost={defaultGridConfig}
                    plugins={plugins}>
                </Grid>

                {/*<Grid 
                    rows={rows} 
                    columns={['id','name']} 
                    gridHost={defaultGridConfig} 
                    plugins={plugins}>
                </Grid>*/}
            </div>
        )
    }
};