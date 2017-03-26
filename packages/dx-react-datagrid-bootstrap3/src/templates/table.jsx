import React from 'react';

export class TableCell extends React.PureComponent {
    render() {
        const { row, column, colspan, cellContentTemplate, isHeader = false } = this.props;
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
    }
};

export class TableRow extends React.PureComponent {
    render() {
        const { row, columns, getCellInfo, cellContentTemplate, cellTemplate, isHeader = false } = this.props;
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
    }
};

export class Table extends React.PureComponent {
    render() {
        const { headerRows, bodyRows, columns, cellContentTemplate, cellTemplate, rowTemplate, getCellInfo } = this.props;
        const TableRow = rowTemplate;

        return (
            <table style={{ borderCollapse: 'collapse', width: '100%' }} className="table table-condensed">
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
    }
};