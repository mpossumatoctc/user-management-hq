
import React from 'react';

import { difference } from 'lodash';

import DynamicComponent from './dynamic.component';
import DetailsComponent from './details.component';

import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';

import IconButton from 'material-ui/lib/icon-button';
import MoreVert from 'material-ui/lib/svg-icons/navigation/more-vert';
import Dialog from 'material-ui/lib/dialog';
import LinearProgress from 'material-ui/lib/linear-progress';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import D2DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Pagination from 'd2-ui/lib/pagination/Pagination.component';

import DataTableContextMenu from 'd2-ui/lib/data-table/DataTableContextMenu.component';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui';

import Paper from 'material-ui/lib/paper';

import 'd2-ui/lib/css/DataTable.css';
import 'd2-ui/lib/css/Pagination.css';

const TableRowColumnWrapper = ({ style, onCellClick, children }) => (
    <TableRowColumn style={style} onCellClick={onCellClick}>
        {children}
    </TableRowColumn>
);

const dummyHeaderModel = {};

// TODO: PropTypes
// TODO: Clean up this css!
class DataTableComponent extends DynamicComponent {
    loadDataModel() {
        // TODO: Migrate into Actions
        const { model, section } = this.props;
        const { page } = this.state;
        const { params } = section;

        const listParams = Object.assign({}, params, (page ? { page } : null));
        model.list(listParams).then(this.updateDataSource.bind(this));
    }

    componentDidMount() {
        if (this.isValid()) {
            this.loadDataModel();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const isSectionChange = prevProps.section !== this.props.section;
        const isModelChange = prevProps.model !== this.props.model;
        const isPageChange = prevState.page !== this.state.page;

        if (isSectionChange || isModelChange || isPageChange) {
            this.updateDataSource(null, this.loadDataModel.bind(this));
        }
    }

    isValid() {
        return this.props.section && this.props.model;
    }

    getTranslation(key) {
        return this.context.d2.i18n.getTranslation(camelCaseToUnderscores(key));
    }

    getSelectedIndices() {
        const { dataSource, selectedIndices } = this.state;

        if (selectedIndices === 'none') {
            return [];
        }
        else if (selectedIndices === 'all') {
            const rows = [];
            for (let i = 0, ilen = dataSource.valuesContainerMap.size; i < ilen; i++) {
                rows.push(i);
            }
            return rows;
        }

        return selectedIndices || [];
    }

    getSelectedRows() {
        const { dataSource } = this.state;
        if (!dataSource) { return []; }

        const values = Array.from(dataSource.values());

        return this.getSelectedIndices().map(index => values[index]);
    }

    ensureDataTablePersistence() {
        const selectedRows = this.getSelectedIndices();
        this.tableBody.setState({ selectedRows });
    }

    onRowSelection(indices) {
        const { dataSource, selectedIndices } = this.state;
        let { selectedModel } = this.state;

        const currentSelections = Array.isArray(selectedIndices) ? selectedIndices.slice() : [];

        const updateState = () => {
            this.setState({
                selectedIndices: indices,
                selectedModel
            }, () => this.ensureDataTablePersistence());
        }

        if (typeof indices === 'string') {
            selectedModel = null;
            return updateState();
        }

        const newIndex = indices.filter(i => currentSelections.indexOf(i) === -1)[0] || indices[indices.length - 1];
        const rows = dataSource.valuesContainerMap;
        const entries = Array.from(rows.keys());
        const newKey = entries[newIndex];

        selectedModel = rows.get(newKey);

        updateState();
    }

    iconMenuClick(evt, model) {
        evt.preventDefault();
        evt.stopPropagation();

        this.setState({
            contextMenuTarget: evt.currentTarget,
            contextMenuActiveItem: model
        }, () => this.ensureDataTablePersistence());
    }

    onActionInvoke() {
        const totalTime = 90; // est completion time (seconds)

        this.timerId = setInterval(() => {
            const currentProgress = this.state.progress;
            this.setState({ progress: Math.floor(currentProgress + 1.2) });
        }, 1000);

        this.setState({ isExecuting: true, progress: 0 });
    }

    onActionFinished() {
        clearInterval(this.timerId);

        this.setState({ isExecuting: false, progress: 0 }, () => {
            window.location.reload();
        });
    }

    renderContextMenu() {
        const { contextMenuTarget, contextMenuActiveItem } = this.state;
        const { modelAction, contextMenuIcons } = this.props;

        const hasItem = Object.keys(contextMenuActiveItem || {}).length > 0;
        const item = modelAction
            ? (hasItem ? contextMenuActiveItem : this.getSelectedRows())
            : null;

        let actions = {};
        let icons = {};

        if (item) {
            actions = modelAction.getWrappedActions(item, this.onActionInvoke.bind(this), this.onActionFinished.bind(this)) || actions;
            icons = modelAction.getIcons(item) || icons;
        }

        return (
            <DataTableContextMenu
                target={contextMenuTarget}
                onRequestClose={() => this.setState({ contextMenuActiveItem: undefined }, () => this.ensureDataTablePersistence())}
                actions={actions}
                activeItem={contextMenuActiveItem}
                icons={icons}
            />
        );
    }

    render() {
        const { section, model, modelAction, views } = this.props;
        const { dataSource, selectedModel, selectedIndices, isExecuting = false, progress = 0 } = this.state;

        const hasActions = !!modelAction;
        const hasMultipleSelections = selectedIndices === 'all' ||
            (Array.isArray(selectedIndices) && selectedIndices.length > 0);

        if (!this.isValid()) { return null; }
        if (!dataSource) {
            return (<LoadingMask />);
        }

        const rows = dataSource.valuesContainerMap;
        const recordTotal = ((dataSource.pager && dataSource.pager.total ? dataSource.pager.total : rows.size) || 0).toLocaleString();

        const pager = (!dataSource.pager || dataSource.pager.pageCount === 1) ? null : (
            <Pagination
                hasPreviousPage={() => dataSource.pager.page > 1}
                hasNextPage={() => dataSource.pager.page !== dataSource.pager.pageCount}
                onPreviousPageClick={() => this.setState({ page: dataSource.pager.page - 1})}
                onNextPageClick={() => this.setState({ page: dataSource.pager.page + 1})}
                total={dataSource.pager.pageCount}
                currentlyShown={dataSource.pager.page} 
            />
        );

        const selectedModelDefinition = selectedModel ? selectedModel.modelDefinition : null;
        const detailView = (!selectedModelDefinition || !views[selectedModelDefinition.name]) ? null :
            this.getDynamicView(views[selectedModelDefinition.name], {
                style: { width: '24%', display: 'table-cell', overflowY: 'auto' },
                model: selectedModel,
                onClose: () => this.setState({ selectedModel: null }, () => this.ensureDataTablePersistence())
            });

        const dataTableStyle = detailView ?
            { width: '65%', paddingRight: '20px', display: 'table-cell' } :
            { width: '100%', paddingRight: 'initial', display: 'block' };

        return (
            <div>
                <div style={{ float: "left", lineHeight: "40px" }}>
                    Showing {rows.size.toLocaleString()} of {recordTotal} total {section.label.toLowerCase()}.
                </div>
                {pager}
                <div style={{ clear: 'both' }}></div>
                <div style={dataTableStyle}>
                    <Table multiSelectable={true} onRowSelection={(indices) => this.onRowSelection(indices)}>
                        <TableHeader>
                            <TableRow>
                                {section.fields.map(key => <TableHeaderColumn>{this.getTranslation(key)}</TableHeaderColumn>)}
                                {!hasActions ? null : (
                                <TableHeaderColumn>
                                    <IconButton disabled={!hasMultipleSelections} tooltip={this.getTranslation('actions')} onClick={(evt) => this.iconMenuClick(evt, this.getSelectedRows())}>
                                        <MoreVert />
                                    </IconButton>
                                </TableHeaderColumn>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody deselectOnClickaway={false} ref={(el) => this.tableBody = el}>
                            {
                                Array.from(rows.values()).map(row => (
                                    <TableRow>
                                        {section.fields.map(field => <TableRowColumn>{row[field]}</TableRowColumn>)}
                                        {!hasActions ? null : (
                                        <TableRowColumnWrapper>
                                            <IconButton onMouseDown={(evt) => this.iconMenuClick(evt, row)}>
                                                <MoreVert />
                                            </IconButton>
                                        </TableRowColumnWrapper>
                                        )}
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                    {hasActions ? this.renderContextMenu() : null}
                </div>
                {detailView}
                <Dialog title="Saving Data" modal={true} open={isExecuting}>
                    <LinearProgress mode="determinate" value={progress} />
                    <span style={{ margin: '10px', textAlign: 'center', display: 'block', marginTop: '28px' }}>
                    Please wait while your changes are saved...this might take minutes to complete.
                    </span>
                </Dialog>
            </div>
        );
    }
};

DataTableComponent.contextTypes = {
    d2: React.PropTypes.object.isRequired
};

export default DataTableComponent;
