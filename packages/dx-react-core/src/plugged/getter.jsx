import React from 'react';
import { argumentsShallowEqual } from '../utils/shallowEqual.js';

function getterMemoize(func, onChange) {
  let lastArg = null;
  let lastResult = null;
  return function(...args) {
    if(
      lastArg === null ||
      !argumentsShallowEqual(lastArg, args)
    ) {
      lastResult = func(...args);
      lastArg !== null && onChange(lastResult);
    }
    lastArg = args;
    return lastResult;
  }
}

export const UPDATE_CONNECTION = 'updateConnection';

const noop = () => {};

export class Getter extends React.PureComponent {
    componentWillMount() {
        const { pluginHost } = this.context;
        const { name, pureComputed } = this.props;
        const pureComputedMemoized = getterMemoize(pureComputed, (result) => (this.props.onChange || noop)(result));

        this.plugin = {
            [name + 'Getter']: (original) => () => {
                const { value, connectArgs } = this.props;
                if(value !== undefined) return value;

                let args = [];
                if(connectArgs) {
                    const getter = (getterName) => {
                        if(getterName === name) return original;
                        
                        return pluginHost.get(getterName + 'Getter', this.plugin)
                    };
                    args = connectArgs(getter);
                }
                return pureComputedMemoized(...args);
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