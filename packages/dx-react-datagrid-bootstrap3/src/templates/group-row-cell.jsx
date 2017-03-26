import React from 'react';

export const GroupRowCell = ({ row, isExpanded, toggleGroupExpanded }) => {
    return (
        <div onClick={toggleGroupExpanded}>
            <span>{isExpanded ? '-' : '+'}</span> {row.column}: {row.value}
        </div>
    );
}