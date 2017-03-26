import React from 'react';

export const GroupPanel = ({ grouping, groupByColumn }) => {
    return (
        <div
            style={{ border: '1px solid black', }}>
            {grouping.map(({ column: columnName }) =>
                <div
                    key={columnName}
                    onClick={() => groupByColumn({ columnName, groupIndex: -1 })}
                    style={{ 
                        display: 'inline-block',
                        border: '1px solid black',
                        padding: '3px'
                    }}>
                    {columnName}
                </div>
            )}
        </div>
    );
}