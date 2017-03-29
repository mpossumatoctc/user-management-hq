import React from 'react';

import SidebarNested from '../components/sidebar-nested/sidebar-nested';

import navigationActions from './navigation.actions';

export default React.createClass({
    propTypes: {
        sections: React.PropTypes.array.isRequired,
        currentSectionKey: React.PropTypes.string
    },

    mapSections(sections) {
        this.sectionMap = {};

        const flatten = arr => (arr && arr.forEach(s => (this.sectionMap[s.key] = s) && flatten(s.sections)));

        flatten(sections);
    },

    updateSectionsFromSearchData(data) {
        const { text, state } = data;

        this.sidebar.setSearchText(text);

        if (state === 'cleared') {
            Object.keys(this.sectionMap).forEach(key => delete this.sectionMap[key].badge);
        }
        else {
            Object.keys(data).forEach(key => {
                if (key in this.sectionMap) {
                    const size = data[key].pager && data[key].pager.total ? data[key].pager.total : data[key].size;
                    this.sectionMap[key].badge = (state === 'resolved' ? size.toLocaleString() : '...');
                }
            });
        }

        this.forceUpdate(); // TODO: use STATE for badges?
    },

    componentWillReceiveProps(nextProps) {
        this.mapSections(nextProps.sections);
    },

    componentDidMount() {
        this.mapSections(this.props.sections);

        this.searchSubscriptions = [
            navigationActions.searchResults.subscribe(({ data }) => this.updateSectionsFromSearchData(data))
        ];
    },

    componentWillUnmount() {
        if (this.searchSubscriptions) {
            this.searchSubscriptions.forEach(subscription => subscription.dispose());
            delete this.searchSubscriptions;
        }
    },

    sectionSelected(key) {
        const { onChangeSection = () => {} } = this.props;
        const section = this.sectionMap[key];

        if (section) {
            onChangeSection(section);
        }
    },

    render() {
        const { sections, currentSectionKey } = this.props;

        return (
            <SidebarNested
                sections={sections}
                onChangeSection={this.sectionSelected}
                currentSection={currentSectionKey}
                showSearchField
                searchFieldLabel="Search"
                onChangeSearchText={(text) => navigationActions.search(text)}
                ref={(sidebar) => { this.sidebar = sidebar} }
            />
        );
    }
});
