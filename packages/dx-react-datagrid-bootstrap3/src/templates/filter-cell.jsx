import React from 'react';

export const FilterCell = ({ filter, changeFilter }) => (
    <input
        type="text"
        className="form-control input-sm"
        value={filter}
        onChange={(e) => changeFilter(e.target.value)}
        style={{ width: '100%' }}/>
);