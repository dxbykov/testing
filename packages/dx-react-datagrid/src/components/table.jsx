import React from 'react';

class TableCell extends React.PureComponent {
    render() {
        let { row, column, colspan, cellContentTemplate } = this.props;
        
        return (
            <td
                style={{ 
                    padding: 0,
                    width: (column.width || 100) + 'px' 
                }}
                colSpan={colspan}>
                {cellContentTemplate({ row, column })}
            </td>
        )
    }
};

class TableRow extends React.PureComponent {
    render() {
        let { row, columns, getCellInfo, cellContentTemplate } = this.props;
        
        return (
            <tr>
                {columns.map((column, columnIndex) => {
                    if(row.colspan && columnIndex > 0) return null;
                    const colspan = row.colspan ? columns.length : 1;
                    return (
                        <TableCell key={column.name} row={row} column={column} colspan={colspan} cellContentTemplate={cellContentTemplate} />
                    );
                })}
            </tr>
        )
    }
};

export class Table extends React.PureComponent {
    render() {
        let { rows, columns, cellContentTemplate } = this.props;
        
        return (
            <table style={{ borderCollapse: 'collapse' }}>
                <tbody>
                    {rows.map((row, rowIndex) => 
                        <TableRow key={row.id} row={row} columns={columns} cellContentTemplate={cellContentTemplate} />
                    )}
                </tbody>
            </table>
        );
    }
};