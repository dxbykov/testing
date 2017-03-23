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

class VirtualBox extends React.Component {
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
                    key={`${visibleItemMeta.index}`}
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
                    {this.props.itemTemplate(visibleItemMeta.index)}
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
    virtualHost: React.PropTypes.shape({
        viewport: React.PropTypes.shape({
            top: React.PropTypes.number,
            left: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number,
        }).isRequired,
    }).isRequired,
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
                }
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
    virtualHost: React.PropTypes.shape({
        viewport: React.PropTypes.shape({
            top: React.PropTypes.number,
            left: React.PropTypes.number,
            width: React.PropTypes.number,
            height: React.PropTypes.number,
        }).isRequired,
    }).isRequired
};

export class VirtualTable extends React.Component {
    render() {
        const { headerRows, bodyRows, columns, cellContentTemplate } = this.props;
        const rows = [...headerRows, ...bodyRows];

        return (
            <VirtualBox
                direction="vertical"
                itemCount={rows.length}
                itemInfo={(rowIndex) => ({
                    size: 22,
                    stick: rowIndex < headerRows.length ? 'before' : false,
                })}
                itemTemplate={(rowIndex) => (            
                    <VirtualBox
                        direction="horizontal"
                        itemCount={columns.length}
                        itemInfo={(columnIndex) => ({
                            size: columns[columnIndex].width || 100,
                            stick: false,
                        })}
                        itemTemplate={(columnIndex) => cellContentTemplate({ row: rows[rowIndex], column: columns[columnIndex] })}/>
                )}/>
        )
    }
}