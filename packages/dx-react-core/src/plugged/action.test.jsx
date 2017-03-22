import React from 'react';
import { mount } from 'enzyme';

import { PluginHost } from './host';
import { Action } from './action';
import { Template } from './template';

describe('Action', () => {

    test('should return value', () => {
        const Test = ({ onAction }) => (
            <PluginHost>
                <Action name="test" action={onAction} />

                <Template 
                    name="root"
                    connectActions={(action) => ({
                        onTest: () => action('test')()
                    })}>
                    {({ onTest }) => <h1 onClick={onTest}>Text</h1>}
                </Template>
            </PluginHost>
        );

        const onAction = jest.fn();
        const tree = mount(
            <Test onAction={onAction} />
        );

        tree.find('h1').simulate('click');
        expect(onAction.mock.calls).toHaveLength(1);
    });

});
