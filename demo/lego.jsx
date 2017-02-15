import React from 'react'
import { Grid, Cell, DetailCell, Row, DetailRow } from '../src/lego'

export class LegoDemo extends React.Component {
    constructor(props) {
        super(props);

        let generateData = (length) => {
            let data = [];
            let names = ['Bob', 'Albert', 'Robert', 'Poul', 'Azbest', 'Vova', 'Sonya', 'Marry', 'Sherlock'];
            for(let i = 0; i < length; i++) {
                data.push({ id: i + 1, name: names[Math.floor(Math.random() * names.length)] })
            }
            return data;
        }

        this.state = {
            viewport: { left: 0, top: 0, width: 400, height: 200 },
            columns: [{ name: 'id' }, { name: 'name' }, { name: 'name' }, { name: 'name' }],
            rows: generateData(10000),
            expandedRows: [3]
        }
    }

    render() {
        let { columns, rows } = this.state; 

        return (
            <div>
                <h2>Simple</h2>
                <Grid
                    columns={columns}
                    rows={rows}
                    getRowHeight={() => 40}/>

                <h2>Master Detail</h2>
                <Grid
                    columns={[{ name: 'expand', width: 40 }].concat(columns)}
                    rows={rows}
                    getRowHeight={({ rowIndex }) => this.state.expandedRows.indexOf(rowIndex) > -1 ? 140 : 40}
                    rowTemplate={
                        ({ rowIndex, rowData, columns }) => (
                            <DetailRow
                                columns={columns}
                                rowIndex={rowIndex}
                                rowData={rowData}
                                expanded={this.state.expandedRows.indexOf(rowIndex) > -1}
                                expandedChange={(expanded) => {
                                    let expandedRows = this.state.expandedRows;
                                    if(!expanded && expandedRows.indexOf(rowIndex) > -1) {
                                        expandedRows.splice(expandedRows.indexOf(rowIndex), 1)
                                    } else if (expandedRows.indexOf(rowIndex) === -1) {
                                        expandedRows.push(rowIndex)
                                    }
                                    this.setState({ expandedRows });
                                }}/>
                        )
                    }
                    />
            </div>
        )
    }
}