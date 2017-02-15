import React from 'react'

// Tools

function applyTemplate(template, data) {
    if(React.isValidElement(template))
        return React.cloneElement(template, data)
    return template(data);
};

class WindowedScroller extends React.Component {
    render() {
        let scrollListener = (e) => {
            this.props.onViewportChange({ 
                top: e.currentTarget.scrollTop, 
                left: e.currentTarget.scrollLeft, 
                width: e.currentTarget.offsetWidth,
                height: e.currentTarget.offsetHeight,
            });
        };

        return (
            <div style={{ border: '1px solid black', overflow: 'auto', width: '100%', height: '100%' }}
                onScroll={scrollListener} onTouchMove={scrollListener}>
                {this.props.children}
            </div>
        );
    }
}

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
            viewport: { start: this.props.viewport[positionProp], size: this.props.viewport[sizeProp] },
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
                viewport={this.props.viewport}
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
    viewport: React.PropTypes.shape({
        left: React.PropTypes.number,
        width: React.PropTypes.number,
    }).isRequired,
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
                viewport={this.props.viewport}
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
    viewport: React.PropTypes.shape({
        left: React.PropTypes.number,
        width: React.PropTypes.number,
    }).isRequired,
    columns: React.PropTypes.array.isRequired,
    rowIndex: React.PropTypes.number.isRequired,
    rowData: React.PropTypes.any.isRequired,
    cellTemplate: React.PropTypes.func,
    expanded: React.PropTypes.bool.isRequired,
    expandedChange: React.PropTypes.func.isRequired,
};

export class Grid extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            viewport: { left: 0, top: 0, width: 400, height: 200 }
        }
    }

    render() {
        let cellTemplate = this.props.cellTemplate || (({ rowIndex, columnIndex, data }) => (
            <Cell
                rowIndex={rowIndex}
                columnIndex={columnIndex}
                data={data}/>
        ));

        let rowTemplate = this.props.rowTemplate || (({ rowIndex, rowData, columns, viewport }) => (
            <Row
                viewport={viewport}
                columns={columns}
                rowIndex={rowIndex}
                rowData={rowData}
                cellTemplate={cellTemplate}/>
        ));

        return (
            <div>
                <div style={{ width: this.state.viewport.width + 2 + 'px', height: this.state.viewport.height + 2 + 'px', border: '1px dashed black' }}>
                    <WindowedScroller onViewportChange={(viewport) => this.setState({ viewport })}>
                        <VirtualBox
                            direction="vertical"
                            viewport={this.state.viewport}
                            dataSize={this.props.rows.length}
                            getItemSize={(index) => this.props.getRowHeight({ rowIndex: index })}
                            template={
                                ({ index, position }) => rowTemplate({
                                    rowIndex: index,
                                    rowData: this.props.rows[index],
                                    columns: this.props.columns,
                                    viewport: this.state.viewport,
                                })
                            }/>
                    </WindowedScroller>
                </div>
            </div>
        );
    }
}