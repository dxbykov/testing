import React from 'react'

// Tools

function applyTemplate(template, data) {
    if(React.isValidElement(template))
        return React.cloneElement(template, data)
    return template(data);
};

class WindowedScroller extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            viewport: { top: 0, left: 0, width: 0, height: 0 }
        };

        this.updateViewport = this.updateViewport.bind(this);
    }

    componentDidMount() {
        setTimeout(() => {
            this.updateViewport();
        });
    }

    getChildContext() {
        return {
            virtualHost: {
                viewport: this.state.viewport
            }
        };
    }

    updateViewport() {
        let viewport = { 
            top: this.root.scrollTop, 
            left: this.root.scrollLeft, 
            width: this.root.offsetWidth,
            height: this.root.offsetHeight,
        };

        this.setState({ viewport });
    }

    render() {
        return (
            <div ref={(ref) => this.root = ref}
                onScroll={this.updateViewport} onTouchMove={this.updateViewport}
                style={{ border: '1px solid black', overflow: 'auto', width: '100%', height: '100%', 'WebkitOverflowScrolling': 'touch', 'willChange': 'scroll-position' }}>
                {this.props.children}
            </div>
        );
    }
}
WindowedScroller.childContextTypes = {
    virtualHost: React.PropTypes.shape({
        viewport: React.PropTypes.shape({
            top: React.PropTypes.number,
            left: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number,
        }).isRequired,
    }).isRequired
};

class VirtualBox extends React.Component {
    getVisibleItems(options) {
        let visibleItemMetas = [];

        let index = 0;
        let offset = 0;
        while(index < options.dataSize) {
            let itemSize = options.getItemSize(index);
            if(offset + itemSize > options.viewport.start && offset + itemSize < options.viewport.start + options.viewport.size ||
               offset < options.viewport.start + options.viewport.size && offset > options.viewport.start ||
               offset <= options.viewport.start && offset + itemSize >= options.viewport.start + options.viewport.size) {
                visibleItemMetas.push({ index, offset, size: itemSize });
            }
            index = index + 1;
            offset = offset + itemSize;
        }

        return { visibleItemMetas, fullSize: offset };
    }

    render() {
        let positionProp = this.props.direction === 'horizontal' ? 'left' : 'top';
        let sizeProp = this.props.direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = this.props.direction === 'vertical' ? 'width' : 'height';

        let { visibleItemMetas, fullSize } = this.getVisibleItems({
            viewport: { start: this.context.virtualHost.viewport[positionProp], size: this.context.virtualHost.viewport[sizeProp] },
            getItemSize: this.props.getItemSize,
            dataSize: this.props.dataSize
        });
        
        let visibleItems = visibleItemMetas.map(visibleItemMeta => {
            return (
                <VirtualItem 
                    key={`${visibleItemMeta.index}`}
                    viewport={this.context.virtualHost.viewport}
                    direction={this.props.direction}
                    position={visibleItemMeta.offset}
                    size={visibleItemMeta.size}>
                    {
                        this.props.template({ 
                            index: visibleItemMeta.index, 
                            position: visibleItemMeta.offset 
                        })
                    }
                </VirtualItem>
            );
        })

        return (
            <div style={{ position: 'relative', [sizeProp]: fullSize + 'px', [crossSizeProp]: '100%' }}>
                {visibleItems}
            </div>
        );
    }
}
VirtualBox.propTypes = {
    direction: React.PropTypes.oneOf(['vertical', 'horizontal']).isRequired,
    dataSize: React.PropTypes.number.isRequired,
    getItemSize: React.PropTypes.func.isRequired,
    template: React.PropTypes.func.isRequired
};
VirtualBox.contextTypes = {
    virtualHost: React.PropTypes.shape({
        viewport: React.PropTypes.shape({
            top: React.PropTypes.number,
            left: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number,
        }).isRequired,
    }).isRequired
};

class VirtualItem extends React.Component {
    getChildContext() {
        let { direction, position, size, viewport } = this.props;
        
        let positionProp = direction === 'horizontal' ? 'left' : 'top';
        let crossPositionProp = direction === 'horizontal' ? 'top' : 'left';
        let sizeProp = direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = direction === 'horizontal' ? 'height' : 'width';

        return {
            virtualHost: {
                viewport: {
                    [positionProp]: Math.max(viewport[positionProp] - position, 0),
                    [crossPositionProp]: viewport[crossPositionProp],
                    [sizeProp]: Math.min(viewport[positionProp] + viewport[sizeProp] - position, viewport[sizeProp]),
                    [crossSizeProp]: viewport[crossSizeProp],
                }
            }
        };
    }

    render() {
        let positionProp = this.props.direction === 'horizontal' ? 'left' : 'top';
        let sizeProp = this.props.direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = this.props.direction === 'vertical' ? 'width' : 'height';

        return (
            <div style={{ position: 'absolute', [positionProp]: this.props.position + 'px', [sizeProp]: this.props.size + 'px', [crossSizeProp]: '100%' }}>
                {this.props.children}
            </div>
        );
    }
}
VirtualItem.propTypes = {
    direction: React.PropTypes.oneOf(['vertical', 'horizontal']).isRequired,
    position: React.PropTypes.number.isRequired,
    size: React.PropTypes.number.isRequired,
    viewport: React.PropTypes.shape({
        top: React.PropTypes.number,
        left: React.PropTypes.number,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
    }).isRequired,
};
VirtualItem.childContextTypes = {
    virtualHost: React.PropTypes.shape({
        viewport: React.PropTypes.shape({
            top: React.PropTypes.number,
            left: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number,
        }).isRequired,
    }).isRequired
};

// Components

export class Cell extends React.Component {
    render() {
        let { rowIndex, columnIndex, data } = this.props;
        let template = this.props.template || (({ rowIndex, columnIndex, data }) => 
            `{${rowIndex}:${columnIndex}} ${data}`
        );

        return (
            <div style={{ padding: '10px', border: '1px dotted black' }}>
                {template({ rowIndex, columnIndex, data })}
            </div>
        );
    }
}
Cell.propTypes = {
    rowIndex: React.PropTypes.number.isRequired,
    columnIndex: React.PropTypes.number.isRequired,
    data: React.PropTypes.any.isRequired,
    template: React.PropTypes.func
};

export class DetailCell extends React.Component {
    render() {
        let { rowIndex, columnIndex, data } = this.props;
        let template = this.props.template || (() => this.props.expanded ? 'C' : 'E');

        return (
            <div style={{ padding: '10px', border: '1px dotted black' }} onClick={() => this.props.expandedChange(!this.props.expanded)}>
                {template({ rowIndex, columnIndex, data })}
            </div>
        );
    }
}
DetailCell.propTypes = {
    rowIndex: React.PropTypes.number.isRequired,
    columnIndex: React.PropTypes.number.isRequired,
    template: React.PropTypes.func,
    expanded: React.PropTypes.bool.isRequired,
    expandedChange: React.PropTypes.func.isRequired,
}; 

export class Row extends React.Component {
     render() {
        let cellTemplate = this.props.cellTemplate || (({ rowIndex, columnIndex, data }) => (
            <Cell
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                data={data}/>
        ));

        return (
            <VirtualBox
                direction="horizontal"
                dataSize={this.props.columns.length}
                getItemSize={(index) => this.props.columns[index].width || 200}
                template={
                    ({ index }) => cellTemplate({ 
                        rowIndex: this.props.rowIndex,
                        columnIndex: index,
                        data: this.props.rowData[this.props.columns[index].name]
                    })
                }/>
        );
    }
}
Row.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired,
    cellTemplate: React.PropTypes.func,
};

export const rowProvider = {
    getSize: () => 40,
    template: ({ rowIndex, rowData, columns, cellTemplate }) => (
        <Row
            columns={columns}
            rowIndex={rowIndex}
            rowData={rowData}
            cellTemplate={cellTemplate}/>
    )
};

export class DetailRow extends React.Component {
    render() {
        let cellTemplate = this.props.cellTemplate || (({ rowIndex, columnIndex, data }) => {
            if(this.props.columns[columnIndex].name === 'expand') {
                return (
                    <DetailCell
                        rowIndex={rowIndex}
                        columnIndex={columnIndex}
                        expanded={this.props.expanded}
                        expandedChange={(expanded) => {
                            this.props.expandedChange(expanded);
                        }}/>
                );
            }
            return (
                <Cell
                    rowIndex={rowIndex}
                    columnIndex={columnIndex}
                    data={data}/>
            );
        });

        let rowTemplate = (
            <Row
                columns={this.props.columns}
                rowIndex={this.props.rowIndex}
                rowData={this.props.rowData}
                cellTemplate={cellTemplate}/>
        );
        let detailTemplate = this.props.expanded && (
            <div style={{ width: '100%', height: 100 }}>
                This is detail view
            </div>
        );

        return (
            <div>
                <div style={{ height: 40 + 'px' }}>
                    {rowTemplate}
                </div>
                {detailTemplate}
            </div>
        );
    }
}
DetailRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired,
    cellTemplate: React.PropTypes.func,
    expanded: React.PropTypes.bool.isRequired,
    expandedChange: React.PropTypes.func.isRequired,
};

export const detailProvider = (options) => {
    let { isExpanded, toggleExpanded, collapsedHeight, expandedHeight } = options;

    return {
        getSize: (index) => isExpanded(index) ? expandedHeight : collapsedHeight,
        template: ({ rowIndex, rowData, columns }) => {
            return (
                <DetailRow
                    columns={columns}
                    rowIndex={rowIndex}
                    rowData={rowData}
                    expanded={isExpanded(rowIndex)}
                    expandedChange={(expanded) => toggleExpanded(rowIndex, expanded)}/>
            );
        }
    }
}

export class GroupRow extends React.Component {
    render() {
        let getItemSize = (index) => {
            if(index === 0) 
                return 40;
            return rowProvider.getSize(index);
        };
        let itemTemplate = ({ index, position }) => {
            if(index === 0) {
                return (
                    <div onClick={() => this.props.expandedChange(!this.props.expanded)} style={{ width: '100%', height: '100%', border: '1px dashed black' }}>
                        {`[${this.props.expanded ? '-' : '+'}] Group: ${this.props.rowData.value}`}
                    </div>
                );
            }

            return rowProvider.template({
                rowIndex: index - 1,
                rowData: this.props.rowData.items[index - 1],
                columns: this.props.columns,
            });
        };

        return (
            <VirtualBox
                direction="vertical"
                dataSize={(this.props.expanded ? this.props.rowData.items.length : 0) + 1}
                getItemSize={getItemSize}
                template={itemTemplate}/>
        );
    }
}
GroupRow.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired,
    rowProvider: React.PropTypes.shape({
        getSize: React.PropTypes.func.isRequired,
        template: React.PropTypes.func.isRequired,
    }).isRequired,
};

export const groupProvider = (options) => {
    let { isExpanded, toggleExpanded } = options;

    return {
        getSize: (index, row) => 40 + (isExpanded(index) ? row.items.length * 40 : 0),
        template: ({ rowIndex, rowData, columns, cellTemplate }) => (
            <GroupRow
                columns={columns}
                rowIndex={rowIndex}
                rowData={rowData}
                rowProvider={rowProvider}
                expanded={isExpanded(rowIndex)}
                expandedChange={(expanded) => toggleExpanded(rowIndex, expanded)}/>
        )
    };
};

export class Grid extends React.Component {
    render() {
        let { rowProvider } = this.props
        let cellTemplate = this.props.cellTemplate || (({ rowIndex, columnIndex, data }) => (
            <Cell
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                data={data}/>
        ));

        let rowTemplate = this.props.rowTemplate || (({ rowIndex, rowData, columns }) => (
            <Row
                columns={columns}
                rowIndex={rowIndex}
                rowData={rowData}
                cellTemplate={cellTemplate}/>
        ));

        return (
            <div style={{ height: '200px', border: '1px dashed black' }}>
                <WindowedScroller>
                    <VirtualBox
                        direction="vertical"
                        dataSize={this.props.rows.length}
                        getItemSize={(index) => rowProvider.getSize(index, this.props.rows[index])}
                        template={
                            ({ index, position }) => rowProvider.template({
                                rowIndex: index,
                                rowData: this.props.rows[index],
                                columns: this.props.columns,
                                cellTemplate: cellTemplate,
                            })
                        }/>
                </WindowedScroller>
            </div>
        );
    }
}
Grid.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rows: React.PropTypes.array.isRequired,
    cellTemplate: React.PropTypes.func,
    rowProvider: React.PropTypes.shape({
        getSize: React.PropTypes.func.isRequired,
        template: React.PropTypes.func.isRequired,
    }).isRequired,
};
Grid.defaultProps = {
    rowProvider: rowProvider
}
