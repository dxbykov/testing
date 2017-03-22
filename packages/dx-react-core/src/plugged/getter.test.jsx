import React from 'react';
import { mount } from 'enzyme';

import { PluginHost } from './host';
import { Template } from './template';
import { Getter } from './getter';

describe('Getter', () => {
    
    test('should return value', () => {
        const tree = mount(
            <PluginHost>
                <Getter name="test" value={(getter, params) => params} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('test')('arg')
                    })}>
                    {({ prop }) => <h1>{prop}</h1>}
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('arg');
    });

    test('can use other getters', () => {
        const tree = mount(
            <PluginHost>
                <Getter name="dep" value={() => 'dep'} />
                <Getter name="test" value={(getter) => getter('dep')()} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('test')()
                    })}>
                    {({ prop }) => <h1>{prop}</h1>}
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('dep');
    });

    test('can extend getter with same name', () => {
        const tree = mount(
            <PluginHost>
                <Getter name="test" value={(getter, params) => 'base_' + params} />
                <Getter name="test" value={(original, getter, params) => original(params) + '_extended'} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('test')('param')
                    })}>
                    {({ prop }) => <h1>{prop}</h1>}
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('base_param_extended');
    });

    test('notifies dependencies to update', () => {
        class EncapsulatedPlugin extends React.PureComponent {
            render() {
                return (
                    <Template 
                        name="root"
                        connectGetters={(getter) => ({
                            prop: getter('test')()
                        })}>
                        {({ prop }) => <h1>{prop}</h1>}
                    </Template>
                );
            }
        };

        const Test = ({ text }) => (
            <PluginHost>
                <EncapsulatedPlugin />

                <Getter name="test" value={() => text} />
            </PluginHost>
        );

        const tree = mount(
            <Test text="extended" />
        );
        tree.setProps({ text: 'new' });

        expect(tree.find('h1').text()).toBe('new');
    });

});
