import React from 'react';
import { Pagination } from 'react-bootstrap';

export const Pager = ({ currentPage, onPageChange, totalPages }) => (
    <Pagination
          items={totalPages}
          activePage={currentPage + 1}
          onSelect={page => onPageChange(page - 1)} />
);