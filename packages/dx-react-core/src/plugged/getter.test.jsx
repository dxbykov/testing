import React from 'react';
import { mount } from 'enzyme';

import { PluginHost } from './host';
import { Template } from './template';
import { Getter } from './getter';

describe('Getter', () => {
    
    test('should return value', () => {
        const tree = mount(
            <PluginHost>
                <Getter name="test" value={'arg'} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('test')()
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
                <Getter name="dep" value={'dep'} />
                <Getter name="test"
                    pureComputed={({ dep }) => dep}
                    connectArgs={(getter) => ({
                        dep: getter('dep')()
                    })}/>

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

    test('order has the meaning', () => {
        const tree = mount(
            <PluginHost>
                <Getter name="dep" value={'base'} />
                <Getter name="test"
                    pureComputed={({ dep }) => dep}
                    connectArgs={(getter) => ({
                        dep: getter('dep')()
                    })}/>

                <Getter name="dep" value={'overriden'} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('test')()
                    })}>
                    {({ prop }) => <h1>{prop}</h1>}
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('base');
    });

    test('latest result should be tracked in template', () => {
        const tree = mount(
            <PluginHost>
                <Getter name="dep" value={'base'} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('dep')()
                    })}>
                    {({ prop }) => <h1>{prop}</h1>}
                </Template>
                    
                <Getter name="dep" value={'overriden'} />
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('overriden');
    });

    test('can extend getter with same name', () => {
        const tree = mount(
            <PluginHost>
                <Getter name="test" value={'base'}/>
                <Getter name="test"
                    pureComputed={({ original }) => original + '_extended'}
                    connectArgs={(getter) => ({
                        original: getter('test')()
                    })} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('test')()
                    })}>
                    {({ prop }) => <h1>{prop}</h1>}
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('base_extended');
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

                <Getter name="test" value={text} />
            </PluginHost>
        );

        const tree = mount(
            <Test text="extended" />
        );
        tree.setProps({ text: 'new' });

        expect(tree.find('h1').text()).toBe('new');
    });

    test('notifies when updated', () => {
        const Test = ({ text, onChange }) => (
            <PluginHost>
                <Getter name="test" value={text} />
                <Getter name="test"
                    pureComputed={({ original }) => original + '_extended'}
                    connectArgs={(getter) => ({
                        original: getter('test')()
                    })}
                    onChange={onChange} />

                <Template 
                    name="root"
                    connectGetters={(getter) => ({
                        prop: getter('test')()
                    })}>
                    {({ prop }) => <h1>{prop}</h1>}
                </Template>
            </PluginHost>
        );

        const onChange = jest.fn();
        const tree = mount(
            <Test text="text" onChange={onChange} />
        );
        tree.setProps({ text: 'text' });
        tree.setProps({ text: 'new' });

        expect(onChange.mock.calls).toHaveLength(1);
        expect(onChange.mock.calls[0][0]).toBe('new_extended');
    });

    // This test is not correct enough. Rewrite it in future
    test('memoization based on args', () => {
        let value = {},
            log = [];
        
        class EncapsulatedPlugin extends React.PureComponent {
            render() {
                return (
                    <div>
                        <Getter name="test" 
                            pureComputed={({ param }) => ({})}
                            connectArgs={(getter) => ({ 
                                param: getter('test')()
                            })} />

                        <Template 
                            name="root"
                            connectGetters={(getter) => {
                                log.push(getter('test')());
                            }} />
                    </div>
                );
            }
        };
        const Test = ({ value }) => (
            <PluginHost>
                <Getter name="test" value={value} force={{}} />
                <EncapsulatedPlugin />
            </PluginHost>
        );

        const tree = mount(
            <Test value={value} />
        );
        tree.setProps({ value });
        tree.setProps({ value: {} });
        
        expect(log).toHaveLength(3);
        expect(log[0]).toBe(log[1]);
        expect(log[1]).not.toBe(log[2]);
    });

});
