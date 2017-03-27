import React from 'react';
import { Pagination } from 'react-bootstrap';

export const Pager = ({ currentPage, onPageChange, totalPages }) => (
    <Pagination
        style={{ margin: 0 }}
        items={totalPages}
        activePage={currentPage + 1}
        boundaryLinks
        maxButtons={5}
        onSelect={page => onPageChange(page - 1)} />
);