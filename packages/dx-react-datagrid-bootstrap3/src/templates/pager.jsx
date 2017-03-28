import React from 'react';
import { Pagination } from 'react-bootstrap';

export const Pager = ({ currentPage, onCurrentPageChange, totalPages }) => (
    <Pagination
        style={{ margin: 0 }}
        items={totalPages}
        activePage={currentPage + 1}
        boundaryLinks
        maxButtons={5}
        onSelect={page => onCurrentPageChange(page - 1)} />
);