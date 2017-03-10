import React from 'react';

import { asPluginComponent } from './pluggable';

const renderCellContent = ({ row, column }, original) => {
    if(row.type === 'header' && !column.type) {
        return column.field;
    }
    return original({ row, column });
};

export default asPluginComponent(() => {
    return {
        components: {
            renderCellContent: (original, host) => ({ row, column }) => renderCellContent({ row, column }, original)
        },
        selectors: {
            tableRowsSelector: (original, host) => state => [{ type: 'header' }, ...original(state)]
        }
    };
});