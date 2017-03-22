import React from 'react';
import { mount } from 'enzyme';

import { PluginHost } from './host';
import { Template } from './template';
import { TemplatePlaceholder } from './template-placeholder';

describe('TemplatePlaceholder', () => {
    
    test('template should be rendered in placeholder', () => {
        const tree = mount(
            <PluginHost>
                <Template name="test">
                    <h1>Test content</h1>
                </Template>

                <Template name="root">
                    <TemplatePlaceholder name="test" />
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').exists()).toBeTruthy();
    });
    
    test('template should be rendered in placeholder with params', () => {
        const tree = mount(
            <PluginHost>
                <Template name="test">
                    {({ text }) => (
                        <h1>{text}</h1>
                    )}
                </Template>

                <Template name="root">
                    <TemplatePlaceholder name="test" params={{ text: 'param' }} />
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('param');
    });
    
    test('template chain should be rendered in placeholder', () => {
        const tree = mount(
            <PluginHost>
                <Template name="test">
                    <h1>Test content</h1>
                </Template>

                <Template name="test">
                    <div> {/* TODO: Wrapper required for multiple children */}
                        <TemplatePlaceholder />
                        <h2>Test content</h2>
                    </div>
                </Template>

                <Template name="root">
                    <TemplatePlaceholder name="test" />
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').exists()).toBeTruthy();
        expect(tree.find('h2').exists()).toBeTruthy();
    });
    
    test('template chain should be rendered in placeholder with params', () => {
        const tree = mount(
            <PluginHost>
                <Template name="test">
                    {({ text }) => (
                        <h1>{text}</h1>
                    )}
                </Template>

                <Template name="test">
                    {({ text }) => (
                        <div> {/* TODO: Wrapper required for multiple children */}
                            <TemplatePlaceholder />
                            <h2>{text}</h2>
                        </div>
                    )}
                </Template>

                <Template name="root">
                    <TemplatePlaceholder name="test" params={{ text: 'param' }} />
                </Template>
            </PluginHost>
        );

        expect(tree.find('h1').text()).toBe('param');
        expect(tree.find('h2').text()).toBe('param');
    });

});
