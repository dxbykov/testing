import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';

// Core
const pagingHelpers = {
    paginate: (originalRows, pageSize, page) => {
        return originalRows.slice(pageSize * page, pageSize * (page + 1));
    },
    ensurePageHeaders: (originalRows, pageSize) => {
        let result = originalRows.slice(),
            currentIndex = pageSize;

        while(result.length > currentIndex) {
            let row = result[currentIndex],
                parentRows = [];
            
            while(row._parentRow) {
                parentRows.unshift(row._parentRow);
                row = row._parentRow;
            }
            
            if(parentRows.length) {
                result.splice(currentIndex, 0, ...parentRows);
            }

            currentIndex += pageSize;
        }

        return result;
    }
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

        this._ensurePageHeaders = ({ rows, pageSize }) => pagingHelpers.ensurePageHeaders(rows, pageSize);
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
                        if(totalPages - 1 < page) {
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
                        page,
                    })}/>
            </div>
        )
    }
};