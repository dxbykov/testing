import React from 'react';

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
};
let stickyProp = testCSSProp('position', 'sticky');

export class VirtualBox extends React.Component {
    getChildContext() {
        let { direction, position, stick } = this.props;
        position = position || 0;
        let viewport = this.context.virtualHost.viewport;
        
        let positionProp = direction === 'horizontal' ? 'left' : 'top';
        let crossPositionProp = direction === 'horizontal' ? 'top' : 'left';
        let sizeProp = direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = direction === 'horizontal' ? 'height' : 'width';

        return {
            virtualHost: {
                viewport: {
                    [positionProp]: stick ? position : Math.max(viewport[positionProp] - position, 0),
                    [crossPositionProp]: viewport[crossPositionProp],
                    [sizeProp]: stick ? viewport[sizeProp] : Math.min(viewport[positionProp] + viewport[sizeProp] - position, viewport[sizeProp]),
                    [crossSizeProp]: viewport[crossSizeProp],
                }
            }
        };
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
            let itemSize = itemInfo.size;
            let itemStick = itemInfo.stick;
            
            if(itemStick === 'before' && offset <= viewportStart) {
                stickyItemsMetas.push({ index, offset, size: itemSize, stick: itemStick });
                viewportStart = viewportStart + itemSize;
            }

            if((offset + itemSize > viewportStart && offset + itemSize < viewportStart + viewportSize ||
                offset < viewportStart + viewportSize && offset > viewportStart ||
                offset <= viewportStart && offset + itemSize >= viewportStart + viewportSize) &&
                itemSize > 0 && itemStick === false) {
                visibleItemMetas.push({ index, offset, size: itemSize, stick: false });
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
    getItemStyles({ position, size, stick }) {
        let { direction, crossSize } = this.props;
        let viewport = this.context.virtualHost.viewport;

        let positionProp = direction === 'horizontal' ? 'left' : 'top';
        let crossPositionProp = direction === 'vertical' ? 'left' : 'top';
        let sizeProp = direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = direction === 'vertical' ? 'width' : 'height';

        let styles = {
            position: 'absolute',
            [positionProp]: position + 'px',
        };

        if(stick) {
            if(stickyProp) {
                styles = {
                    ...styles,

                    position: stickyProp,
                    [positionProp]: position + (viewport[positionProp + 'Stick'] || 0) + 'px',
                }
            } else {
                if(direction === 'vertical') {
                    styles = {
                        position: 'fixed',
                        [crossSizeProp]: viewport[crossSizeProp] + 'px',
                        overflow: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        backfaceVisibility: 'hidden'
                    }
                    /*children = (
                        <div style={{ marginLeft: -viewport[crossPositionProp] + 'px', width: '100%', height: '100%' }}>
                            {children}
                        </div>
                    );*/
                } else {
                    styles = {
                        ...styles,

                        [positionProp]: 
                            viewport[positionProp] + 
                            ((viewport[positionProp + 'Stick'] || 0) - (viewport[positionProp + 'ChildStick'] || 0)) + 
                            position + 'px',
                    }
                }
            }
        }

        return { 
            ...styles,
            display: 'block',
            [sizeProp]: size + 'px',
            [crossSizeProp]: crossSize + 'px'
        };
    }
    render() {
        let { direction, position, stick, iref } = this.props;
        let viewport = this.context.virtualHost.viewport;

        let positionProp = direction === 'horizontal' ? 'left' : 'top';
        let sizeProp = direction === 'horizontal' ? 'width' : 'height';
        let crossSizeProp = direction === 'vertical' ? 'width' : 'height';
        
        let { visibleItemMetas, fullSize, stickyBeforeSize } = this.getVisibleItems({
            viewport: { start: stick ? position : viewport[positionProp], size: viewport[sizeProp] },
            itemCount: this.props.itemCount,
            itemInfo: this.props.itemInfo,
        });
        
        let visibleItems = visibleItemMetas.map(visibleItemMeta => {
            var styles = this.getItemStyles({
                position: visibleItemMeta.offset,
                size: visibleItemMeta.size,
                stick: visibleItemMeta.stick,
            });

            return React.cloneElement(
                this.props.itemTemplate(visibleItemMeta.index, visibleItemMeta.offset),
                {
                    key: `${visibleItemMeta.index}`,
                    style: styles,
                }
            );
        })

        const RootTag = this.props.rootTag || 'div';
        
        return (
            <RootTag
                className={this.props.className}
                style={{
                    position: 'relative',
                    ...this.props.style,
                    [sizeProp]: fullSize + 'px',
                    display: 'block',
                }}
                {...(iref ? { ref: iref } : {})}>
                {visibleItems}
            </RootTag>
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
    virtualHost: React.PropTypes.object,
};
VirtualBox.childContextTypes = {
    virtualHost: React.PropTypes.object.isRequired
};