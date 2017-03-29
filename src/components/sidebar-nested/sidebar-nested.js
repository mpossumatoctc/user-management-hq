import React from 'react';

import { Badge, FontIcon, List, ListItem } from 'material-ui';

import Sidebar from 'd2-ui/lib/sidebar/Sidebar.component';

require('./sidebar-nested.scss');

// TODO: Material-ui List instead??
class SidebarNested extends Sidebar {
    constructor(props, state) {
        super(props, state);

        this.renderSections = this.renderNestedSections.bind(this);
    }

    setSearchText(text) {
        this.setState({ searchText: text });
    }

    renderNestedSections() {
        const { sections = [] } = this.props;
        const { currentSection, searchText } = this.state;

        const renderSections = (sections, currentLevel, key = 'root') => {
            const listItems = sections.reduce((array, section) => {
                const className = `${(section.key === currentSection ? 'active' : 'inactive')}-item`;
                const icon = (typeof section.icon === 'string' || section.icon instanceof String)
                    ? <FontIcon className="material-icons">{section.icon}</FontIcon>
                    : section.icon;

                const badge = !section.badge ? null : (
                    <Badge badgeContent={section.badge} style={{ float: 'right', marginTop: '-4px' }} secondary={true} />
                );

                const listItem = (
                    <ListItem
                        key={section.key}
                        primaryText={section.label}
                        onClick={this.setSection.bind(this, section.key)}
                        className={className}
                        leftIcon={icon}
                    >
                        {badge}
                    </ListItem>
                );

                array.push(listItem);

                if (Array.isArray(section.sections) && section.sections.length > 0) {
                    array = array.concat(renderSections(section.sections, currentLevel + 1, `${key}_${section.key}`));
                }

                return array;
            }, []);

            return (
                <List className={`sidebar-nested level-${currentLevel}`} key={key}>
                    {listItems}
                </List>
            );
        };

        return renderSections(sections, 0);
    }
}

export default SidebarNested;
