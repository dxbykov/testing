import React from 'react';

export const Pager = ({ currentPage, onPageChange, totalPages }) => {
    let pages = [];
    for(let i = 0; i < Math.max(totalPages, 1); i++)
        pages.push(i);

    return (
        <div
            style={{ border: '1px solid black', }}>
            {pages.map((page) =>
                <div
                    key={page}
                    onClick={() => onPageChange(page)}
                    style={{ 
                        display: 'inline-block',
                        border: `1px solid ${ page === currentPage ? 'red' : 'black' }`,
                        padding: '0 3px'
                    }}>
                    {page + 1}
                </div>
            )}
        </div>
    );
}