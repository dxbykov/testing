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
               offset < options.viewport.start + options.viewport.size && offset > options.viewport.start) {
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
        let crossSizeProp = this.props.direction === 'horizontal' ? 'height' : 'width';

        let { visibleItemMetas, fullSize } = this.getVisibleItems({
            viewport: { start: this.context.virtualHost.viewport[positionProp], size: this.context.virtualHost.viewport[sizeProp] },
            getItemSize: this.props.getItemSize,
            dataSize: this.props.dataSize
        });
        
        let visibleItems = visibleItemMetas.map(visibleItemMeta => {
            return (
                <div key={`${visibleItemMeta.index}`} style={{
                        position: 'absolute',
                        [positionProp]: visibleItemMeta.offset + 'px',
                        [sizeProp]: visibleItemMeta.size + 'px',
                        [crossSizeProp]: '100%'
                    }}>{
                    this.props.template({ 
                        index: visibleItemMeta.index, 
                        position: visibleItemMeta.offset 
                    })
                }</div>
            );
        })

        return (
            <div style={{ position: 'relative', [sizeProp]: fullSize + 'px' }}>
                {visibleItems}
            </div>
        );
    }
}
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
        let cellTemplate = this.props.cellTemplate || (({ rowIndex, columnIndex, data }) => {});

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
            <div style={{ width: '100%', height: '100%' }}>
                <div style={{ width: '100%', height: 40 + 'px' }}>
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

export class Grid extends React.Component {
    render() {
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
            <div style={{ width: '400px', height: '200px', border: '1px dashed black' }}>
                <WindowedScroller>
                    <VirtualBox
                        direction="vertical"
                        dataSize={this.props.rows.length}
                        getItemSize={(index) => this.props.getRowHeight({ rowIndex: index })}
                        template={
                            ({ index, position }) => rowTemplate({
                                rowIndex: index,
                                rowData: this.props.rows[index],
                                columns: this.props.columns,
                            })
                        }/>
                </WindowedScroller>
            </div>
        );
    }
}