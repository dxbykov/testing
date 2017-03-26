import React from 'react';

export const GroupRowCell = ({ row, isExpanded, toggleGroupExpanded }) => {
    return (
        <div onClick={toggleGroupExpanded}>
            <i className={`glyphicon glyphicon-triangle-${isExpanded ? 'bottom' : 'right'}` } /> {row.column}: {row.value}
        </div>
    );
}