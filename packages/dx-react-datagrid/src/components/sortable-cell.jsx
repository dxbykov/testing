import React from 'react';

export const SortableCell = ({ direction, changeDirection, children }) => (
    <div 
        onClick={changeDirection}
        style={{ width: '100%', height: '100%' }}>
        {children} [{ direction ? (direction === 'desc' ? '↑' : '↓') : '#'}]
    </div>
);