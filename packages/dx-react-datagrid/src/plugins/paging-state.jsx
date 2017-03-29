import React from 'react';
import { Getter, Action } from '@devexpress/dx-react-core';
import { paginate, ensurePageHeaders, setCurrentPage } from '@devexpress/dx-datagrid-core';

export class PagingState extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: props.defaultPage || 0,
    };

    this._setCurrentPage = ({ page }) => {
      const { onCurrentPageChange } = this.props;
      const currentPage = setCurrentPage(this.state.currentPage, { page });
      this.setState({ currentPage });
      onCurrentPageChange && onCurrentPageChange(currentPage);
    };

    this._totalPages = (rows, pageSize) => Math.ceil(rows.length / pageSize);
  }
  render() {
    const { pageSize } = this.props;
    const currentPage = this.props.currentPage || this.state.currentPage;

    return (
      <div>
        <Action name="setCurrentPage" action={({ page }) => this._setCurrentPage({ page })} />

        <Getter name="currentPage" value={currentPage} />
        <Getter
          name="totalPages"
          pureComputed={this._totalPages}
          connectArgs={getter => [
            getter('rows')(),
            pageSize,
          ]}
          onChange={(totalPages) => {
            if (totalPages - 1 < currentPage) {
              this._setCurrentPage({ page: Math.max(totalPages - 1, 0) });
            }
          }}
        />

        <Getter
          name="rows"
          pureComputed={ensurePageHeaders}
          connectArgs={getter => [
            getter('rows')(),
            pageSize,
          ]}
        />

        <Getter
          name="rows"
          pureComputed={paginate}
          connectArgs={getter => [
            getter('rows')(),
            pageSize,
            currentPage,
          ]}
        />
      </div>
    );
  }
}
