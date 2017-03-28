import React from 'react';

export const TableCell = ({ row, column, colspan, cellContentTemplate, isHeader = false }) => {
    const TagName = isHeader ? 'th' : 'td';
    
    return (
        <TagName
            style={{ 
                width: column.width ? column.width + 'px' : 'auto' 
            }}
            colSpan={colspan}>
            {cellContentTemplate({ row, column })}
        </TagName>
    )
};

export const TableRow = ({ row, columns, getCellInfo, cellContentTemplate, cellTemplate, isHeader = false }) => {
    const TableCell = cellTemplate;
    
    return (
        <tr style={{ height: row.height ? row.height === 'auto' ? 'auto' : row.height + 'px' : 'auto' }}>
            {columns.map((column, columnIndex) => {
                let info = getCellInfo({ row, column, columnIndex, columns });
                if(info.skip) return null;
                return (
                    <TableCell
                        key={column.name}
                        isHeader={isHeader}
                        row={row}
                        column={column}
                        colspan={info.colspan}
                        cellContentTemplate={cellContentTemplate} />
                );
            })}
        </tr>
    )
};

export const Table = ({ headerRows, bodyRows, columns, cellContentTemplate, cellTemplate, rowTemplate, getCellInfo }) => {
    const TableRow = rowTemplate;

    return (
        <table style={{ borderCollapse: 'collapse', width: '100%' }} className="table">
            <thead>
                {headerRows.map((row, rowIndex) => 
                    <TableRow
                        key={row.id}
                        row={row}
                        columns={columns}
                        cellContentTemplate={cellContentTemplate}
                        cellTemplate={cellTemplate}
                        getCellInfo={getCellInfo}
                        isHeader={true} />
                )}
            </thead>
            <tbody>
                {bodyRows.map((row, rowIndex) => 
                    <TableRow
                        key={row.id}
                        row={row}
                        columns={columns}
                        cellContentTemplate={cellContentTemplate}
                        cellTemplate={cellTemplate}
                        getCellInfo={getCellInfo} />
                )}
            </tbody>
        </table>
    );
};