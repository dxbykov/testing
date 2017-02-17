import React from 'react'
import { 
    Grid,
    Cell, cellProvider, DetailCell, detailCellProvider,
    Row, rowProvider, headingRowProvider, DetailRow, detailRowProvider, GroupRow, groupRowProvider
} from '../src/lego'

import {
    expandedStateController
} from '../src/data/controllers'

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
            rows: [{ type: 'heading', id: 'ID', name: 'Name' }].concat(generateData(1000))
        };
    }

    render() {
        let { columns, rows } = this.state; 

        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProviders={{
                    '*': rowProvider(),
                    'heading': headingRowProvider()
                }}/>
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
        };

        this.setState = this.setState.bind(this);
        this.expandedCtrl = expandedStateController(() => this.state, this.setState);
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = ({ row }) => this.expandedCtrl.isExpanded(row.id);
        return (
            <Grid
                columns={columns}
                rows={rows}
                cellProviders={{
                    '*': cellProvider(),
                    'detail': detailCellProvider({
                        isExpanded,
                        toggleExpanded: ({ row }) => this.expandedCtrl.toggleExpanded(row.id)
                    })
                }}
                rowProviders={{
                    '*': detailRowProvider({
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
            expandedRows: ['Female']
        }

        this.setState = this.setState.bind(this);
        this.expandedCtrl = expandedStateController(() => this.state, this.setState);
    }

    render() {
        let { columns, rows } = this.state;
        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProviders={{
                    '*': rowProvider(),
                    'group': groupRowProvider({
                        isExpanded: ({ row }) => this.expandedCtrl.isExpanded(row.value),
                        toggleExpanded: ({ row }) => this.expandedCtrl.toggleExpanded(row.value)
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
                { type: 'heading', id: 'ID', name: 'Name' },
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
            expandedRows: ['Female', 'FemaleA-M']
        }

        this.setState = this.setState.bind(this);
        this.expandedCtrl = expandedStateController(() => this.state, this.setState);
    }

    render() {
        let { columns, rows } = this.state;
        let keyGetter = (row) => (row.subvalue || '') + row.value;
        return (
            <Grid
                columns={columns}
                rows={rows}
                rowProviders={{
                    '*': rowProvider(),
                    'group': groupRowProvider({
                        isExpanded: ({ row }) => this.expandedCtrl.isExpanded(keyGetter(row)),
                        toggleExpanded: ({ row }) => this.expandedCtrl.toggleExpanded(keyGetter(row))
                    }),
                    'heading': headingRowProvider()
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

        this.setState = this.setState.bind(this);
        this.expandedRowsCtrl = expandedStateController(() => this.state, this.setState);
        this.expandedGroupsCtrl = expandedStateController(
            () => {
                return { expandedRows: this.state.expandedGroups };
            },
            (state) => {
                this.setState({ expandedGroups: state.expandedRows });
            }
        );
    }

    render() {
        let { columns, rows } = this.state;
        let isExpanded = ({ row }) => this.expandedGroupsCtrl.isExpanded(row.value);
        let isExpandedRow = ({ row }) => this.expandedRowsCtrl.isExpanded(row.id);
        return (
            <Grid
                columns={columns}
                rows={rows}
                cellProviders={{
                    '*': cellProvider(),
                    'detail': detailCellProvider({
                        isExpanded: isExpandedRow,
                        toggleExpanded: ({ row }) => this.expandedRowsCtrl.toggleExpanded(row.id)
                    })
                }}
                rowProviders={{
                    '*': detailRowProvider({
                        isExpanded: isExpandedRow,
                        collapsedHeight: 40,
                        expandedHeight: 80
                    }),
                    'group': groupRowProvider({
                        isExpanded,
                        toggleExpanded: ({ row }) => this.expandedGroupsCtrl.toggleExpanded(row.value)
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
                <Box title="Simple with Heading" demo={SimpleDemo}/>
                <Box title="Master Detail" demo={MasterDetailDemo}/>
                <Box title="Grouped" demo={GroupedDemo}/>
                <Box title="Nested Grouped with Heading" demo={NestedGroupedDemo}/>
                <Box title="Grouped Master Detail" demo={GroupedMasterDetailDemo}/>
            </div>
        )
    }
}