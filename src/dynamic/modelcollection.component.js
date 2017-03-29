import React from 'react';

import { get } from 'lodash';

import sorters from '../helpers/sorters';
import { List, ListItem } from 'material-ui/lib/lists';

import navigationActions from '../navigation/navigation.actions';

import './modelcollection.component.scss';

class ModelCollectionComponent extends React.Component {
    showModelDetails(model) {
        // TODO: This is hacky...fix
        const { name } = model;
        navigationActions.search(name);
    }

    render() {
        const { source, property, sorter, listItemProps, subheader, ...otherProps } = this.props;

        let data = property;
        if (data) {
            data = (Array.isArray(data) ? data : data.toArray());
            if (sorters[sorter]) {
                const sorterFunction = sorters[sorter]('name'); // TODO: display property should come from props
                data = data.sort(sorterFunction);
            }
        }

        const listItems = (data || []).map(item =>
            <ListItem
                key={item.id}
                secondaryText={item.id}
                onClick={this.showModelDetails.bind(this, item)}
                className={'model-collection-listitem'}
                {...listItemProps}
            >
                {item.name}
            </ListItem>
        );

        return (
            <List subheader={`${subheader} (${listItems.length})`} {...otherProps}>
                {listItems}
            </List>
        )
    }
}

export default ModelCollectionComponent;
