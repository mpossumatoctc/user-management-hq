import React from 'react';

import { get } from 'lodash';
import { IconButton, FontIcon, Card, CardHeader } from 'material-ui';

import DynamicComponent from './dynamic.component';

// TODO: PropTypes
class DetailsComponent extends React.Component {
    render() {
        const { style, onClose, model, headerProps, children = [], ...otherProps } = this.props;
        const headerProperties = Object.assign({ title: '', subtitle: '' }, headerProps);

        const getModelValue = (propertyName) => get(model, propertyName) || propertyName;

        const childElements = children.map((child) => DynamicComponent.getDynamicView(model, child));

        return (
            <Card style={style} key={`${model.id}_details`}>
                <CardHeader title={getModelValue(headerProperties.title)} subtitle={getModelValue(headerProperties.subtitle)}>
                    <IconButton onClick={onClose} style={{ float: 'right', marginTop: '-18px', marginRight: '-18px' }}>
                        <FontIcon className="material-icons">close</FontIcon>
                    </IconButton>
                </CardHeader>
                {childElements}
            </Card>
        );
    }
}

export default DetailsComponent;
