import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';

// Core
const pagingHelpers = {
    paginate: (originalRows, pageSize, page) => {
        return originalRows.slice(pageSize * page, pageSize * (page + 1));
    },
};

// UI
export class PagingState extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            page: props.defaultPage || 0
        };

        this.changePage = (page) => {
            let { onPageChange } = this.props;
            this.setState({ page });
            onPageChange && onPageChange(page);
        };

        this._rows = ({ rows, pageSize, page }) => pagingHelpers.paginate(rows, pageSize, page);
    }
    render() {
        const { pageSize } = this.props;
        const page = this.props.page || this.state.page;

        return (
            <div>
                <Action name="pageChange" action={({ page }) => this.changePage(page)} />

                <Getter name="currentPage" value={page} />
                <Getter name="totalPages"
                    pureComputed={({ rows, pageSize }) => Math.ceil(rows.length / pageSize)}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        pageSize,
                    })}
                    onChange={(totalPages) => {
                        if(totalPages < page) {
                            this.changePage(Math.max(totalPages - 1, 0));
                        }
                    }} />

                <Getter name="rows"
                    pureComputed={this._rows}
                    connectArgs={(getter) => ({
                        rows: getter('rows')(),
                        pageSize,
                        page,
                    })}/>
            </div>
        )
    }
};