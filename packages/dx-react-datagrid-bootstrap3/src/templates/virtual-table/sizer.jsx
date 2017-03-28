import React from 'react';

export class Sizer extends React.Component {
    componentDidMount() {
        const watchSizes = () => {
            const rect = this.root.getBoundingClientRect();
            this.sizeUpdated(rect.width, rect.height);
            this._raf = requestAnimationFrame(watchSizes);
        };
        watchSizes();
    }
    componentWillUnmount() {
        cancelAnimationFrame(this._raf);
    }
    sizeUpdated(newWidth, newHeight) {
        const { width, height, onWidthChange, onHeightChange } = this.props;

        if(newHeight !== height) {
            onHeightChange && onHeightChange(newHeight);
        }
    }
    render() {
        const { children } = this.props;

        return (
            <div ref={(ref) => this.root = ref}>
                {children}
            </div>
        )
    }
}