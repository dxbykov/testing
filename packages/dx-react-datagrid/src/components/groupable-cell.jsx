import React from 'react';

export const GroupableCell = ({ groupByColumn, children }) => (
    <div style={{ width: '100%', height: '100%' }}>
        {children} <span onClick={groupByColumn}>[G]</span>
    </div>
);