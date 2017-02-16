import React from 'react'
import { WindowedScroller, VirtualBox, VirtualItem } from './components'
import { cellProvider } from './cells'
import { rowProvider, Rows } from './rows'

export class Grid extends React.Component {
    getChildContext() {
        return {
            gridHost: {
                cellProviders: this.props.cellProviders,
                rowProviders: this.props.rowProviders,
            }
        };
    }

    render() {
        let { rows, columns } = this.props

        return (
            <div style={{ height: '260px', border: '1px solid black' }}>
                <WindowedScroller>
                    <Rows
                        rows={rows}
                        columns={columns}/>
                </WindowedScroller>
            </div>
        );
    }
}
Grid.propTypes = {
    columns: React.PropTypes.array.isRequired,
    rows: React.PropTypes.array.isRequired,
    cellProviders: React.PropTypes.object,
};
Grid.defaultProps = {
    cellProviders: { '*': cellProvider() },
    rowProviders: { '*': rowProvider() }
};
Grid.childContextTypes = {
    gridHost: React.PropTypes.shape({
        cellProviders: React.PropTypes.object.isRequired,
        rowProviders: React.PropTypes.object.isRequired,
    }).isRequired
};
