import React from 'react';

export const SortableCell = ({ direction, changeDirection, children }) => {
    const iconName = direction ? (direction === 'asc' ? 'glyphicon glyphicon-arrow-down' : 'glyphicon glyphicon-arrow-up') : '';
    return (
        <div 
            onClick={changeDirection}
            style={{ width: '100%', height: '100%' }} >
            <div
                style={{
                    float: 'right',
                    width: '30px',
                    textAlign: 'right'
                }}><i className={`glyphicon ${iconName}` } style={{ float: 'right' }} /></div>
            <div
                style={{
                    paddingRight: '30px'
                }}>{children}</div>
        </div>        
    );
};