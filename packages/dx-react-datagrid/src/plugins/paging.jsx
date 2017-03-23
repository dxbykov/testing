import React from 'react';
import { Template, TemplatePlaceholder } from '@devexpress/dx-react-core';
import { Pager } from '../components/pager.jsx';

export class Paging extends React.PureComponent {
    render() {
        return (
            <div>
                <Template name="root">
                    <div style={{ display: 'inline-block' }}> {/* TODO: Fiber remove */}
                        <TemplatePlaceholder />
                        <TemplatePlaceholder name="pager" />
                    </div>
                </Template>
                <Template
                    name="pager"
                    connectGetters={(getter) => ({
                        currentPage: getter('currentPage')(),
                        totalPages: getter('totalPages')(),
                    })}
                    connectActions={(action) => ({
                        onPageChange: (page) => action('pageChange')({ page }),
                    })}>
                    <Pager />
                </Template>
            </div>
        );
    }
}