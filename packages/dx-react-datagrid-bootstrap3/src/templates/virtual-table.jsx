import React from 'react';
import { Sizer } from './virtual-table/sizer.jsx';
import { WindowedScroller } from './virtual-table/windowed-scroller.jsx';
import { VirtualBox } from './virtual-table/virtual-box.jsx';

const DEFAULT_HEIGHT = 38;
const DEFAULT_WIDTH = 200;

export class VirtualTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            autoHeights: new WeakMap()
        };

        this.rowHeight = (row) => row.height ? row.height === 'auto' ? this.state.autoHeights.get(row) || DEFAULT_HEIGHT : row.height : DEFAULT_HEIGHT;
        this.columnWidth = (column) => column.width || DEFAULT_WIDTH;
    }
    render() {
        const { headerRows, bodyRows, columns, cellContentTemplate } = this.props;
        
        const headerCell = ({ row, column }) => {
            let template = cellContentTemplate({ row, column });
            return (
                <th>
                    {template}
                </th>
            );
        };

        const cell = ({ row, column }) => {
            let template = cellContentTemplate({ row, column });
            if(row.height === 'auto') {
                template = (
                    <Sizer
                        height={this.rowHeight(row) - 17} // TODO: paddings
                        onHeightChange={(height) => {
                            let { autoHeights } = this.state;
                            autoHeights.set(row, height + 17); // TODO: paddings
                            this.setState({ autoHeights })
                        }}>
                        {template}
                    </Sizer>
                );
            }
            return (
                <td>
                    {template}
                </td>
            );
        };

        const row = (row, cellTemplate, position) => {
            const colspan = row.colspan;
            const columnLength = colspan !== undefined ? colspan + 1 : columns.length;
            return (
                <VirtualBox
                    rootTag="tr"

                    position={position}
                    crossSize={this.rowHeight(row)}
                    direction="horizontal"
                    itemCount={columnLength}
                    itemInfo={(columnIndex) => {
                        const size = columnIndex !== colspan
                            ? this.columnWidth(columns[columnIndex])
                            : columns.slice(colspan).reduce((accum, column) => accum + this.columnWidth(column), 0);
                        
                        return {
                            size: size,
                            stick: false,
                        };
                    }}
                    itemTemplate={(columnIndex) => cellTemplate({ row, column: columns[columnIndex] })}/>
            );
        };

        const tHead = (position) => (
            <VirtualBox
                key="thead"
                rootTag="thead"

                iref={(ref) => {
                    if(!ref) return;
                    ref.style.backgroundColor = window.getComputedStyle(document.body).backgroundColor;
                }}

                position={position}
                stick={true}
                direction="vertical"
                itemCount={headerRows.length}
                itemInfo={(rowIndex) => ({
                    size: this.rowHeight(headerRows[rowIndex]),
                    stick: false,
                })}
                itemTemplate={(rowIndex, position) => row(headerRows[rowIndex], headerCell, position)}/>
        );

        const tBody = (position) => (
            <VirtualBox
                key="tbody"
                rootTag="tbody"
                
                position={position}
                direction="vertical"
                itemCount={bodyRows.length}
                itemInfo={(rowIndex) => ({
                    size: this.rowHeight(bodyRows[rowIndex]),
                    stick: false,
                })}
                itemTemplate={(rowIndex, position) => row(bodyRows[rowIndex], cell, position)}/>
        );

        return (
            <div style={{ height: '500px' }}>
                <WindowedScroller>
                    <VirtualBox
                        rootTag="table"
                        className="table"

                        direction="vertical"
                        itemCount={2}
                        itemInfo={(rowIndex) => {
                            const size = rowIndex === 0
                                ? headerRows.reduce((accum, row) => accum + this.rowHeight(row), 0)
                                : bodyRows.reduce((accum, row) => accum + this.rowHeight(row), 0);
                            
                            return {
                                size: size,
                                stick: rowIndex === 0 ? 'before' : false,
                            };
                        }}
                        itemTemplate={(rowIndex, position) => rowIndex === 0 ? tHead(position) : tBody(position)}/>
                </WindowedScroller>
            </div>
        )
    }
}