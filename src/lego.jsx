import React from 'react'
import { WindowedScroller, VirtualBox, VirtualItem } from './lego/components'
import { Cell, DetailCell } from './lego/cells'
import { Row, rowProvider, GroupRow, groupProvider, DetailRow, detailProvider } from './lego/rows'

export { Cell, DetailCell, Row, rowProvider, GroupRow, groupProvider, DetailRow, detailProvider };

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
            <div style={{ height: '260px', border: '1px solid black' }}>
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
