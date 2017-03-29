import React from 'react';

import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn, TableRowColumn } from 'material-ui/lib/table';
import { Checkbox } from 'material-ui/lib';

import schemaStore from '../schema/schema.store';

// TODO: PropTypes
class MatrixViewComponent extends React.Component {
    render() {
        const { source, matrix } = this.props;
        const schema = schemaStore.getState();
        const matrixSchema = schema.matrices[matrix];

        return (
            <Table selectable={false}>
                <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                    <TableRow>
                        <TableHeaderColumn colSpan={matrixSchema.headers.length} style={{ color: 'rgb(0,0,0,0.54)', fontSize: '14px', paddingLeft: '16px' }}>
                            {matrixSchema.name}
                        </TableHeaderColumn>
                    </TableRow>
                    <TableRow>
                        {matrixSchema.headers.map(text => <TableHeaderColumn style={{ color: '#757575' }}>{text}</TableHeaderColumn>)}
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {
                        Object.keys(matrixSchema.definition).map(name =>
                            <TableRow selectable={false}>
                                <TableRowColumn>{name}</TableRowColumn>
                                {matrixSchema.definition[name].map(synthetic => {
                                    const value = synthetic.call(source, {}, React); // TODO: Fix ME!! / Refactor
                                    const isChecked = !(!value || (Array.isArray(value) && value.length === 0));

                                    return (
                                        <TableRowColumn>
                                            <Checkbox checked={isChecked} disabled={true} />
                                        </TableRowColumn>
                                    );
                                })}
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
        );
    }
}

export default MatrixViewComponent;
