import React from 'react';
import shallowEqual from '../utils/shallowEqual.js';

function getterMemoize(func) {
  let lastArg = null
  let lastResult = null
  return (arg) => {
    if (
      lastArg === null ||
      !shallowEqual(lastArg, arg)
    ) {
      lastResult = func(arg)
    }
    lastArg = arg
    return lastResult
  }
}

export const UPDATE_CONNECTION = 'updateConnection';

export class Getter extends React.PureComponent {
    componentWillMount() {
        const { pluginHost } = this.context;
        const { name, pureComputed } = this.props;
        const pureComputedMemoized = getterMemoize(pureComputed);

        this.plugin = {
            [name + 'Getter']: (original) => () => {
                const { value, connectArgs } = this.props;
                if(value) return value;

                let args = {};
                if(connectArgs) {
                    const getter = (getterName) => getterName === name ? original : pluginHost.get(getterName + 'Getter');
                    args = connectArgs(getter);
                }
                return pureComputedMemoized(args);
            }
        };

        pluginHost.registerPlugin(this.plugin);
    }
    componentWillUnmount() {
        const { pluginHost } = this.context;

        pluginHost.unregisterPlugin(this.plugin)
    }
    componentDidUpdate() {
        const { pluginHost } = this.context;

        pluginHost.broadcast(UPDATE_CONNECTION);
    }
    render() {
        return null;
    }
};
Getter.contextTypes = {
    pluginHost: React.PropTypes.object.isRequired,
};