
import React from 'react';

import DynamicComponent from './dynamic.component';
import DetailsComponent from './details.component';

import LoadingMask from 'd2-ui/lib/loading-mask/LoadingMask.component';
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Pagination from 'd2-ui/lib/pagination/Pagination.component';

import Paper from 'material-ui/lib/paper';

import 'd2-ui/lib/css/DataTable.css';
import 'd2-ui/lib/css/Pagination.css';

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

    render() {
        const { section, model, views } = this.props;
        const { dataSource, selectedModel } = this.state;

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
                style: { width: '24%', display: 'inline-block', position: 'fixed', right: '4px', top: '135px', bottom: '20px', overflowY: 'auto' },
                model: selectedModel,
                onClose: () => this.setState({ selectedModel: null })
            });

        return (
            <div>
                <div style={{ float: "left", lineHeight: "40px" }}>
                    Showing {rows.size.toLocaleString()} of {recordTotal} total {section.label.toLowerCase()}.
                </div>
                {pager}
                <div style={{ clear: 'both' }}></div>
                <div style={{ width: (!detailView ? '100%' : '70%'), display: 'inline-block' }}>
                    <DataTable
                        columns={section.fields}
                        rows={rows}
                        primaryAction={selectedModel => this.setState({ selectedModel })}
                    />
                </div>
                {detailView}
            </div>
        );
    }
}

export default DataTableComponent;
