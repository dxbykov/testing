import React from 'react';

class TableCell extends React.PureComponent {
    render() {
        let { row, column, colspan, cellContentTemplate } = this.props;
        
        return (
            <td
                style={{ 
                    padding: 0,
                    width: column.width ? column.width + 'px' : 'auto' 
                }}
                colSpan={colspan}>
                {cellContentTemplate({ row, column })}
            </td>
        )
    }
};

class TableRow extends React.PureComponent {
    render() {
        let { row, columns, cellContentTemplate, getCellInfo } = this.props;
        
        return (
            <tr style={{ height: row.height ? row.height === 'auto' ? 'auto' : row.height + 'px' : '20px' }}>
                {columns.map((column, columnIndex) => {
                    let info = getCellInfo({ row, column, columnIndex, columns });
                    if(info.skip) return null;
                    return (
                        <TableCell key={column.name} row={row} column={column} colspan={info.colspan} cellContentTemplate={cellContentTemplate} />
                    );
                })}
            </tr>
        )
    }
};

export class Table extends React.PureComponent {
    render() {
        let { rows, columns, cellContentTemplate, getCellInfo } = this.props;
        
        return (
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    {rows.map((row, rowIndex) => 
                        <TableRow key={row.id} row={row} columns={columns} cellContentTemplate={cellContentTemplate} getCellInfo={getCellInfo} />
                    )}
                </tbody>
            </table>
        );
    }
};