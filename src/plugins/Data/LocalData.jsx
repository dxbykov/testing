import React from 'react';
import LocalDataSorting from './LocalDataSorting';
import LocalDataFiltering from './LocalDataFiltering';
import PluginGroup from '../PluginGroup';

export default class LocalData extends React.PureComponent {
    render() {
        return <PluginGroup>
            <LocalDataFiltering />
            <LocalDataSorting />
        </PluginGroup>;
    }
}