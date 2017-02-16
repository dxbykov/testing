import React from 'react';

export function applyTemplate(template, data) {
    if(React.isValidElement(template))
        return React.cloneElement(template, data)
    return template(data);
};

export class WindowedScroller extends React.Component {
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
                style={{ overflow: 'auto', width: '100%', height: '100%', 'WebkitOverflowScrolling': 'touch', 'willChange': 'scroll-position' }}>
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

export class VirtualBox extends React.Component {
    getVisibleItems(options) {
        let visibleItemMetas = [];

        let index = 0;
        let offset = 0;
        while(index < options.dataSize) {
            let itemSize = options.getItemSize(index);
            if((offset + itemSize > options.viewport.start && offset + itemSize < options.viewport.start + options.viewport.size ||
                offset < options.viewport.start + options.viewport.size && offset > options.viewport.start ||
                offset <= options.viewport.start && offset + itemSize >= options.viewport.start + options.viewport.size) &&
                itemSize > 0) {
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

export class VirtualItem extends React.Component {
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