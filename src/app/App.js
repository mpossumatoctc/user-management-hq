import React from 'react';
import log from 'loglevel';

import HeaderBarComponent from 'd2-ui/lib/app-header/HeaderBar';
import headerBarStore$ from 'd2-ui/lib/app-header/headerBar.store';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';

import Navigation from '../navigation/navigation';
import DynamicDataTable from '../dynamic/datatable.component';

import navigationActions from '../navigation/navigation.actions';
import schemaStore from '../schema/schema.store';

const HeaderBar = withStateFrom(headerBarStore$, HeaderBarComponent);

export default React.createClass({
    propTypes: {
        d2: React.PropTypes.object
    },

    childContextTypes: {
        d2: React.PropTypes.object,
    },

    getChildContext() {
        return {
            d2: this.props.d2
        };
    },

    getInitialState() {
        const schema = schemaStore.getState();
        const defaultSection = schema.sections[0];
        const defaultModel = (defaultSection && defaultSection.model ? defaultSection.model.clone() : null);

        return {
            schema,
            currentSection: defaultSection,
            currentModel: defaultModel,
            isSearchModel: false
        };
    },

    onChangeSection(section) {
        const { model, searchModel } = section;
        if (model && typeof model !== 'string') {
            this.setState({ currentSection: section, currentModel: searchModel || model.clone(), isSearchModel: !!searchModel });
        }
    },

    onSearchChange({ data }) {
        const { state } = data;
        const { currentSection, isSearchModel } = this.state;

        if ((state === 'cleared' && isSearchModel) || (state === 'resolved' && currentSection.key in data)) {
            this.onChangeSection(currentSection);
        }
    },

    componentDidMount() {
        this.subscriptions = [
            navigationActions.searchResults.subscribe(this.onSearchChange)
        ];
    },

    componentWillUnmount() {
        if (this.subscriptions) {
            this.subscriptions.forEach(subscription => subscription.dispose());
            delete this.subscriptions;
        }
    },

    render() {
        const { d2 } = this.props;
        const { schema, currentSection, currentModel } = this.state;
        const { views } = schema;

        const currentSectionKey = currentSection ? currentSection.key : null;

        return (
            <div className="app-wrapper">
                <HeaderBar />
                <Navigation
                    sections={schema.sections}
                    currentSection={currentSectionKey}
                    onChangeSection={this.onChangeSection}
                />
                <div className="main-content">
                    <DynamicDataTable section={currentSection} model={currentModel} views={views} />
                </div>
            </div>
        );
    },
});
