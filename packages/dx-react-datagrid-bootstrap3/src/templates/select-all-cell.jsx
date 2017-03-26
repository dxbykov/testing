import React from 'react';

export const SelectAllCell = ({ allSelected, someSelected, toggleAll }) => (
    <input
        type='checkbox'
        checked={allSelected}
        ref={(ref) => { ref && (ref.indeterminate = someSelected)}}
        onChange={toggleAll}
        style={{ margin: '0' }}/>
);