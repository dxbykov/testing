import React from 'react'
import { Grid, Cell, cellProvider, DetailCell, detailCellProvider, Row, rowProvider, DetailRow, detailProvider, GroupRow, groupProvider } from '../src/lego'

let generateData = (length, names, from = 0) => {
    let data = [];
    names = names || ['Bob', 'Albert', 'Robert', 'Poul', 'Azbest', 'Vova', 'Sonya', 'Marry', 'Sherlock'];
    for(let i = from; i < length + from; i++) {
        data.push({ id: i + 1, name: names[Math.floor(Math.random() * names.length)] })
    }
    return data;
}

class SimpleDemo extends React.Component {
    constructor(props) {
        super(props);

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

        this.state = {
            columns: [{ type: 'detail' }, { name: 'id', width: 120 }, { name: 'name' }, { name: 'name' }, { name: 'name' }],
            rows: generateData(1000),
            expandedRows: [3]
        }
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = ({ row }) => this.state.expandedRows.indexOf(row.id) > -1;
        let toggleExpanded = ({ row, expanded }) => {
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
                cellProviders={{
                    '*': cellProvider(),
                    'detail': detailCellProvider({
                        isExpanded,
                        toggleExpanded
                    })
                }}
                rowProviders={{
                    '*': detailProvider({
                        isExpanded,
                        collapsedHeight: 40,
                        expandedHeight: 80
                    })
                }}/>
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
                    items: generateData(80, ['Bob', 'Poul', 'Mark', 'Tim', 'Steve'])
                },
                {
                    type: 'group', value: 'Female',
                    items: generateData(150, ['Nina', 'Anna', 'Marry', 'Nona', 'Adel'], 80)
                }
            ],
            expandedGroups: ['Female']
        }
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = ({ row }) => this.state.expandedGroups.indexOf(row.value) > -1;
        let toggleExpanded = ({ row, expanded }) => {
            let expandedGroups = this.state.expandedGroups;
            if(!expanded && expandedGroups.indexOf(row.value) > -1) {
                expandedGroups.splice(expandedGroups.indexOf(row.value), 1)
            } else if (expandedGroups.indexOf(row.value) === -1) {
                expandedGroups.push(row.value)
            }
            this.setState({ expandedGroups });
        };

        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProviders={{
                    '*': rowProvider(),
                    'group': groupProvider({
                        isExpanded,
                        toggleExpanded,
                    })
                }}/>
        )
    }
}

class NestedGroupedDemo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [{ name: 'id', width: 120 }, { name: 'name' }, { name: 'name' }, { name: 'name' }],
            rows: [
                {
                    type: 'group', level: 0, value: 'Male',
                    items: [
                        {
                            type: 'group', level: 1, subvalue: 'Male', value: 'A-M',
                            items: generateData(20, ['Bob', 'Mark'])
                        },
                        {
                            type: 'group', level: 1, subvalue: 'Male', value: 'M-Z',
                            items: generateData(30, ['Poul', 'Tim', 'Steve'], 20)
                        }
                    ]
                },
                {
                    type: 'group', level: 0, value: 'Female',
                    items: [
                        {
                            type: 'group', level: 1, subvalue: 'Female', value: 'A-M',
                            items: generateData(25, ['Anna', 'Marry', 'Adel'], 50)
                        },
                        {
                            type: 'group', level: 1, subvalue: 'Female', value: 'M-Z',
                            items: generateData(20, ['Nina', 'Nona'], 75)
                        }
                    ]
                }
            ],
            expandedGroups: ['Female', 'FemaleA-M']
        }
    }

    render() {
        let { columns, rows } = this.state;

        let keyGetter = (row) => (row.subvalue || '') + row.value;

        let isExpanded = ({ row }) => this.state.expandedGroups.indexOf(keyGetter(row)) > -1;
        let toggleExpanded = ({ row, expanded }) => {
            let expandedGroups = this.state.expandedGroups;
            if(!expanded && expandedGroups.indexOf(keyGetter(row)) > -1) {
                expandedGroups.splice(expandedGroups.indexOf(keyGetter(row)), 1)
            } else if (expandedGroups.indexOf(keyGetter(row)) === -1) {
                expandedGroups.push(keyGetter(row))
            }
            this.setState({ expandedGroups });
        };

        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProviders={{
                    '*': rowProvider(),
                    'group': groupProvider({
                        isExpanded,
                        toggleExpanded,
                    })
                }}/>
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
                    items: generateData(80, ['Bob', 'Poul', 'Mark', 'Tim', 'Steve'])
                },
                {
                    type: 'group', value: 'Female',
                    items: generateData(150, ['Nina', 'Anna', 'Marry', 'Nona', 'Adel'], 80)
                }
            ],
            expandedGroups: ['Male'],
            expandedRows: [3]
        }
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = ({ row }) => this.state.expandedGroups.indexOf(row.value) > -1;
        let toggleExpanded = ({ row, expanded }) => {
            let expandedGroups = this.state.expandedGroups;
            if(!expanded && expandedGroups.indexOf(row.value) > -1) {
                expandedGroups.splice(expandedGroups.indexOf(row.value), 1)
            } else if (expandedGroups.indexOf(row.value) === -1) {
                expandedGroups.push(row.value)
            }
            this.setState({ expandedGroups });
        };
        let isExpandedRow = ({ row }) => this.state.expandedRows.indexOf(row.id) > -1;
        let toggleExpandedRow = ({ row, expanded }) => {
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
                cellProviders={{
                    '*': cellProvider(),
                    'detail': detailCellProvider({
                        isExpanded: isExpandedRow,
                        toggleExpanded: toggleExpandedRow,
                    })
                }}
                rowProviders={{
                    '*': detailProvider({
                        isExpanded: isExpandedRow,
                        collapsedHeight: 40,
                        expandedHeight: 80
                    }),
                    'group': groupProvider({
                        isExpanded,
                        toggleExpanded,
                    })
                }}/>
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
                <Box title="Nested Grouped" demo={NestedGroupedDemo}/>
                <Box title="Grouped Master Detail" demo={GroupedMasterDetailDemo}/>
            </div>
        )
    }
}