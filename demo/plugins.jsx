import React from 'react';
import './magic.css';
import { generateColumns, generateRows } from './demoData';
import Grid from '../src/plugins/Grid';
import PluginGroup from '../src/plugins/PluginGroup';
import GridHeader from '../src/plugins/GridHeader';
import GridGroupPanel from '../src/plugins/GridGroupPanel';
import GridHeaderRowSorting from '../src/plugins/Sorting/GridHeaderSorting';
import GridSortingState from '../src/plugins/Sorting/GridSortingState';
import GridEditState from '../src/plugins/Editing/GridEditState';
import GridEditRow from '../src/plugins/Editing/GridEditRow';
import GridFilterRow from '../src/plugins/Filtering/GridFilterRow';
import GridFilteringState from '../src/plugins/Filtering/GridFilteringState';
import LocalData from '../src/plugins/Data/LocalData';
import LocalDataFiltering from '../src/plugins/Data/LocalDataFiltering';
import LocalDataSorting from '../src/plugins/Data/LocalDataSorting';

import './plugins.css';

export class PluginsDemo extends React.PureComponent {
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
                <h1>Default Grid</h1>
                <Grid rows={rows}>
                </Grid>

                <h1>With Local Sorting</h1>
                <Grid rows={rows}>
                    <PluginGroup>
                        <GridSortingState />
                        <GridHeaderRowSorting />
                        <LocalDataSorting />
                    </PluginGroup>
                </Grid>

                <h1>With Local Editing</h1>
                <Grid rows={rows}>
                    <PluginGroup>
                        <GridEditRow position="right" />
                        <GridEditState />
                    </PluginGroup>
                </Grid>

                <h1>With Local Filtering</h1>
                <Grid rows={rows}>
                    <PluginGroup>
                        <GridFilterRow />
                        <GridFilteringState />
                        <LocalDataFiltering />
                    </PluginGroup>
                </Grid>
            </div>
        )
    }
};