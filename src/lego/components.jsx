import React from 'react';

export function applyTemplate(template, data) {
    if(React.isValidElement(template))
        return React.cloneElement(template, data)
    return template(data);
};

function testCSSProp(property, value, noPrefixes) {
  let prop = property + ':';
  let el = document.createElement('test');
  let mStyle = el.style;
  
  if(!noPrefixes) {
      mStyle.cssText = prop + ['-webkit-', '-moz-', '-ms-', '-o-', ''].join(value + ';' + prop) + value + ';';
  } else {
      mStyle.cssText = prop + value;
  }    
  return mStyle[property];
}

let isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
export let stickyProp = testCSSProp('position', 'sticky');

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
                viewport: this.state.viewport,
            }
        };
    }

    updateViewport() {
        if(isSafari) {
            requestAnimationFrame(this._updateViewport.bind(this))
        } else {
            this._updateViewport();
        }
    }

    _updateViewport() {
        let oldViewport = this.state.viewport;
        let viewport = { 
            top: this.root.scrollTop, 
            left: this.root.scrollLeft, 
            width: this.root.clientWidth,
            height: this.root.clientHeight,
        };

        // Prevent iOS to flicker in bounces =(
        if(viewport.top < 0 || viewport.left < 0 || viewport.left + viewport.width > this.root.scrollWidth || viewport.top + viewport.height > this.root.scrollHeight) {
            return;
        }

        // Optimize performance
        if(oldViewport.top !== viewport.top || oldViewport.left !== viewport.left || oldViewport.width !== viewport.width || oldViewport.height !== viewport.height) {
            this.setState({ viewport });
        }
    }

    render() {
        return (
            <div ref={(ref) => this.root = ref}
                onScroll={this.updateViewport}
                style={{ 
                    overflow: 'auto',
                    width: '100%',
                    height: '100%',
                    WebkitOverflowScrolling: 'touch',
                    willChange: 'scroll-position',
                }}>
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

export class VirtualBox extends React.PureComponent {
    constructor(props) {
        super();
        this.state = {
            itemSizes: new Array(props.itemCount)
        };
    }
    itemSizeChange(index, size) {
        let newSizes = this.state.itemSizes.slice();
        newSizes[index] = size;
        this.setState({ itemSizes: newSizes });
    }
    getVisibleItems(options) {
        let viewportStart = options.viewport.start;
        let viewportSize = options.viewport.size;

        let visibleItemMetas = [];
        let stickyItemsMetas = [];

        let index = 0;
        let offset = 0;
        while(index < options.itemCount) {
            let itemInfo = options.itemInfo(index);
            let itemSize = this.state.itemSizes[index] || itemInfo.size;
            let itemStick = itemInfo.stick;
            let key = itemInfo.key || index;
            
            if(itemStick === 'before' && offset <= viewportStart) {
                stickyItemsMetas.push({ index, offset, size: itemSize, stick: itemStick, key });
                viewportStart = viewportStart + itemSize;
            }

            let inVisibleBounds = offset + itemSize > viewportStart && offset + itemSize < viewportStart + viewportSize ||
                                  offset < viewportStart + viewportSize && offset > viewportStart ||
                                  offset <= viewportStart && offset + itemSize >= viewportStart + viewportSize;
            if((inVisibleBounds || itemInfo.preserve) && itemSize > 0 && itemStick === false) {
                visibleItemMetas.push({ index, offset, size: itemSize, stick: false, key });
            }

            index = index + 1;
            offset = offset + itemSize;
        }

        return { 
            visibleItemMetas: visibleItemMetas.concat(stickyItemsMetas),
            fullSize: offset,
            stickyBeforeSize: stickyItemsMetas.reduce((accumulator, meta) => accumulator + meta.size, 0)
        };
    }

    render() {
        let viewport = this.context.virtualHost.viewport;

        let positionProp = this.props.direction === 'horizontal' ? 'left' : 'top';
        let sizeProp = this.props.direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = this.props.direction === 'vertical' ? 'width' : 'height';

        let { visibleItemMetas, fullSize, stickyBeforeSize } = this.getVisibleItems({
            viewport: { start: viewport[positionProp], size: viewport[sizeProp] },
            itemCount: this.props.itemCount,
            itemInfo: this.props.itemInfo,
        });
        
        let visibleItems = visibleItemMetas.map(visibleItemMeta => {
            return (
                <VirtualItem 
                    key={visibleItemMeta.key}
                    viewport={{ 
                        ...viewport,
                        [positionProp]: viewport[positionProp] + stickyBeforeSize,
                        
                        [positionProp + 'Stick']: viewport[positionProp + 'Stick'],
                        [positionProp + 'ChildStick']: (viewport[positionProp + 'Stick'] || 0) + stickyBeforeSize
                    }}
                    direction={this.props.direction}
                    position={visibleItemMeta.offset}
                    size={visibleItemMeta.size}
                    stick={visibleItemMeta.stick}>
                    {this.props.itemTemplate(visibleItemMeta.index, (size) => this.itemSizeChange(visibleItemMeta.index, size))}
                </VirtualItem>
            );
        })

        return (
            <div style={{ 
                ...this.props.style,
                position: 'relative',
                [sizeProp]: fullSize + 'px',
                [crossSizeProp]: '100%'
            }}>
                {visibleItems}
            </div>
        );
    }
}
VirtualBox.propTypes = {
    direction: React.PropTypes.oneOf(['vertical', 'horizontal']).isRequired,
    itemCount: React.PropTypes.number.isRequired,
    itemInfo: React.PropTypes.func.isRequired,
    itemTemplate: React.PropTypes.func.isRequired,
};
VirtualBox.contextTypes = {
    virtualHost: React.PropTypes.object.isRequired,
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

                    [positionProp + 'Stick']: viewport[positionProp + 'ChildStick'],
                },
            }
        };
    }

    render() {
        let { direction, position, size, children, stick, viewport } = this.props;

        let positionProp = direction === 'horizontal' ? 'left' : 'top';
        let crossPositionProp = direction === 'vertical' ? 'left' : 'top';
        let sizeProp = direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = direction === 'vertical' ? 'width' : 'height';

        let additionalStyles = {
            position: 'absolute',
            [positionProp]: position + 'px',
            [crossSizeProp]: '100%',
        };

        if(stick) {
            if(stickyProp) {
                additionalStyles = {
                    ...additionalStyles,

                    position: stickyProp,
                    [positionProp]: position + (viewport[positionProp + 'Stick'] || 0) + 'px',
                }
            } else {
                if(direction === 'vertical') {
                    additionalStyles = {
                        position: 'fixed',
                        [crossSizeProp]: viewport[crossSizeProp] + 'px',
                        overflow: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        backfaceVisibility: 'hidden'
                    }
                    children = (
                        <div style={{ marginLeft: -viewport[crossPositionProp] + 'px', width: '100%', height: '100%' }}>
                            {children}
                        </div>
                    );
                } else {
                    additionalStyles = {
                        ...additionalStyles,

                        [positionProp]: 
                            viewport[positionProp] + 
                            ((viewport[positionProp + 'Stick'] || 0) - (viewport[positionProp + 'ChildStick'] || 0)) + 
                            position + 'px',
                    }
                }
            }
        }

        return (
            <div style={{ 
                ...additionalStyles,
                [sizeProp]: size + 'px'
            }}>
                {children}
            </div>
        );
    }
}
VirtualItem.propTypes = {
    direction: React.PropTypes.oneOf(['vertical', 'horizontal']).isRequired,
    position: React.PropTypes.number.isRequired,
    size: React.PropTypes.number.isRequired,
    stick: React.PropTypes.oneOf([false, 'before', 'after']).isRequired,
    viewport: React.PropTypes.shape({
        top: React.PropTypes.number,
        left: React.PropTypes.number,
        width: React.PropTypes.number,
        height: React.PropTypes.number,
    }).isRequired,
};
VirtualItem.childContextTypes = {
    virtualHost: React.PropTypes.object.isRequired
};