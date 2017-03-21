import React from 'react';

export const SelectCell = ({ selected, changeSelected }) => (
    <input
        type='checkbox'
        checked={selected}
        onChange={changeSelected}
        style={{ margin: '0' }}/>
);