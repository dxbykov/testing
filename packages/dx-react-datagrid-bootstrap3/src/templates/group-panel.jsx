import React from 'react';

export const GroupPanel = ({ grouping, groupByColumn, groupByColumnText }) => {
    const text = groupByColumnText || 'Click G in the header to group by column';
    return (
        <div className="panel panel-default" style={{ borderWidth: '1px 0', borderRadius: 0 }}>
            <div className="panel-body">
                {grouping.length
                    ? grouping.map(({ column: columnName }) => 
                        <button
                            type="button"
                            className="btn btn-default"
                            key={columnName}
                            onClick={() => groupByColumn({ columnName, groupIndex: -1 })} 
                            style={{ 
                                marginRight: '5px'
                            }} >
                            {columnName}
                        </button>)
                    : <span>{text}</span>
                }
            </div>
        </div>
    );
}