import React from 'react'
import { Grid, Cell, DetailCell, Row, DetailRow, GroupRow, groupProvider, detailProvider } from '../src/lego'

class SimpleDemo extends React.Component {
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
            columns: [{ name: 'id', width: 120 }, { name: 'name' }, { name: 'name' }, { name: 'name' }],
            rows: generateData(1000)
        }
    }

    render() {
        let { columns, rows } = this.state; 

        return (
            <Grid
                columns={columns}
                rows={rows}/>
        )
    }
}

class MasterDetailDemo extends React.Component {
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
            columns: [{ type: 'detail', width: 40 }, { name: 'id', width: 120 }, { name: 'name' }, { name: 'name' }, { name: 'name' }],
            rows: generateData(1000),
            expandedRows: [3]
        }
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = (rowIndex, row) => this.state.expandedRows.indexOf(row.id) > -1;
        let toggleExpanded = (rowIndex, row, expanded) => {
            let expandedRows = this.state.expandedRows;
            if(!expanded && expandedRows.indexOf(row.id) > -1) {
                expandedRows.splice(expandedRows.indexOf(row.id), 1)
            } else if (expandedRows.indexOf(row.id) === -1) {
                expandedRows.push(row.id)
            }
            this.setState({ expandedRows });
        };

        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProvider={detailProvider({
                    isExpanded,
                    toggleExpanded,
                    collapsedHeight: 40,
                    expandedHeight: 80
                })}/>
        )
    }
}

class GroupedDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [{ name: 'id', width: 120 }, { name: 'name' }, { name: 'name' }, { name: 'name' }],
            rows: [
                {
                    type: 'group', value: 'Male',
                    items: [
                        { id: 1, name: 'Bob' },
                        { id: 2, name: 'Poul' },
                        { id: 3, name: 'Mark' },
                        { id: 4, name: 'Tim' },
                        { id: 5, name: 'Steve' }
                    ]
                },
                {
                    type: 'group', value: 'Female',
                    items: [
                        { id: 1, name: 'Nina' },
                        { id: 2, name: 'Anna' },
                        { id: 3, name: 'Marry' },
                        { id: 4, name: 'Nona' },
                        { id: 5, name: 'Adel' }
                    ]
                }
            ],
            expandedGroups: [1]
        }
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = (rowIndex) => this.state.expandedGroups.indexOf(rowIndex) > -1;
        let toggleExpanded = (rowIndex, expanded) => {
            let expandedGroups = this.state.expandedGroups;
            if(!expanded && expandedGroups.indexOf(rowIndex) > -1) {
                expandedGroups.splice(expandedGroups.indexOf(rowIndex), 1)
            } else if (expandedGroups.indexOf(rowIndex) === -1) {
                expandedGroups.push(rowIndex)
            }
            this.setState({ expandedGroups });
        };

        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProvider={groupProvider({
                    isExpanded,
                    toggleExpanded
                })}/>
        )
    }
}

class GroupedMasterDetailDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [{ type: 'detail', width: 40 }, { name: 'id', width: 120 }, { name: 'name' }, { name: 'name' }, { name: 'name' }],
            rows: [
                {
                    type: 'group', value: 'Male',
                    items: [
                        { id: 1, name: 'Bob' },
                        { id: 2, name: 'Poul' },
                        { id: 3, name: 'Mark' },
                        { id: 4, name: 'Tim' },
                        { id: 5, name: 'Steve' }
                    ]
                },
                {
                    type: 'group', value: 'Female',
                    items: [
                        { id: 6, name: 'Nina' },
                        { id: 7, name: 'Anna' },
                        { id: 8, name: 'Marry' },
                        { id: 9, name: 'Nona' },
                        { id: 10, name: 'Adel' }
                    ]
                }
            ],
            expandedGroups: [],
            expandedRows: [3]
        }
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = (rowIndex) => this.state.expandedGroups.indexOf(rowIndex) > -1;
        let toggleExpanded = (rowIndex, expanded) => {
            let expandedGroups = this.state.expandedGroups;
            if(!expanded && expandedGroups.indexOf(rowIndex) > -1) {
                expandedGroups.splice(expandedGroups.indexOf(rowIndex), 1)
            } else if (expandedGroups.indexOf(rowIndex) === -1) {
                expandedGroups.push(rowIndex)
            }
            this.setState({ expandedGroups });
        };
        let isExpandedRow = (rowIndex, row) => this.state.expandedRows.indexOf(row.id) > -1;
        let toggleExpandedRow = (rowIndex, row, expanded) => {
            let expandedRows = this.state.expandedRows;
            if(!expanded && expandedRows.indexOf(row.id) > -1) {
                expandedRows.splice(expandedRows.indexOf(row.id), 1)
            } else if (expandedRows.indexOf(row.id) === -1) {
                expandedRows.push(row.id)
            }
            this.setState({ expandedRows });
        };

        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProvider={groupProvider({
                    isExpanded,
                    toggleExpanded,
                    rowProvider: detailProvider({
                        isExpanded: isExpandedRow,
                        toggleExpanded: toggleExpandedRow,
                        collapsedHeight: 40,
                        expandedHeight: 80
                    })
                })}/>
        )
    }
}

class Box extends React.Component {
    render() {
        let Demo = this.props.demo;
        return (
            <div style={{ width: '500px', height: '330px', float: 'left', marginLeft: '20px' }}>
                <h2>{this.props.title}</h2>
                <Demo/>
            </div>
        );
    }
}

export class LegoDemo extends React.Component {
    render() {
        return (
            <div>
                <Box title="Simple" demo={SimpleDemo}/>
                <Box title="Master Detail" demo={MasterDetailDemo}/>
                <Box title="Grouped" demo={GroupedDemo}/>
                <Box title="Grouped Master Detail" demo={GroupedMasterDetailDemo}/>
            </div>
        )
    }
}