import React from 'react';
import { Pagination } from 'react-bootstrap';

export const TableDetailToggle = ({ expanded, toggleExpanded }) => (
    <div
        style={{ width: '100%', height: '100%' }}
        onClick={toggleExpanded}>
        <i className={`glyphicon glyphicon-triangle-${expanded ? 'bottom' : 'right'}` }/>
    </div>
);