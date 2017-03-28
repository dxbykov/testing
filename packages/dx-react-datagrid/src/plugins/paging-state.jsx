import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';
import { paginate, ensurePageHeaders, setCurrentPage } from '@devexpress/dx-datagrid-core';

export class PagingState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            currentPage: props.defaultPage || 0
        };

        this._setCurrentPage = ({ page }) => {
            let { onCurrentPageChange } = this.props;
            let currentPage = setCurrentPage(this.state.currentPage, { page });
            this.setState({ currentPage });
            onCurrentPageChange && onCurrentPageChange(currentPage);
        };

        this._ensurePageHeaders = ({ rows, pageSize }) => ensurePageHeaders(rows, pageSize);
        this._rows = ({ rows, pageSize, currentPage }) => paginate(rows, pageSize, currentPage);
    }
    render() {
        const { pageSize } = this.props;
        const currentPage = this.props.currentPage || this.state.currentPage;

        return (
            <div>
                <Action name="setCurrentPage" action={({ page }) => this._setCurrentPage({ page })} />

                <Getter name="currentPage" value={currentPage} />
                <Getter name="totalPages"
                    pureComputed={({ rows, pageSize }) => Math.ceil(rows.length / pageSize)}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        pageSize,
                    })}
                    onChange={(totalPages) => {
                        if(totalPages - 1 < currentPage) {
                            this.changePage(Math.max(totalPages - 1, 0));
                        }
                    }} />

                <Getter name="rows"
                    pureComputed={this._ensurePageHeaders}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        pageSize
                    })}/>

                <Getter name="rows"
                    pureComputed={this._rows}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        pageSize,
                        currentPage,
                    })}/>
            </div>
        )
    }
};