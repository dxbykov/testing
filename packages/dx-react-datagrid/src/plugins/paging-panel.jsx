import React from 'react';
import { Template, TemplatePlaceholder } from '@devexpress/dx-react-core';

export class PagingPanel extends React.PureComponent {
    render() {
        return (
            <div>
                <Template name="gridFooter">
                    <div>
                        <TemplatePlaceholder name="pager" />
                        <TemplatePlaceholder />
                    </div>
                </Template>
                <Template
                    name="pager"
                    connectGetters={(getter) => ({
                        currentPage: getter('currentPage')(),
                        totalPages: getter('totalPages')(),
                    })}
                    connectActions={(action) => ({
                        onCurrentPageChange: (page) => action('setCurrentPage')({ page }),
                    })}>
                    {this.props.pagerTemplate}
                </Template>
            </div>
        );
    }
}