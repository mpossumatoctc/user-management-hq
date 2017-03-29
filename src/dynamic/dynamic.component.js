import React from 'react';

import { get } from 'lodash';

import DynamicComponentIndex from './index';
import schemaStore from '../schema/schema.store';

import ModelCollection from 'd2/lib/model/ModelCollection';
import Model from 'd2/lib/model/Model';

class DynamicComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    updateDataSource(dataSource, callback) {
        if (dataSource) {
            const name = dataSource.modelDefinition.name;
            const schema = schemaStore.getState();
            const synthetics = schema.synthetics[name] || [];

            let target = [];

            if (dataSource instanceof ModelCollection && dataSource.valuesContainerMap) {
                target = Array.from(dataSource.valuesContainerMap.values());
            } else if (dataSource instanceof Model) {
                dataSource.push(target);
            }

            target.forEach(model => synthetics.forEach(syn => syn.bind(model)));
        }

        this.setState({ dataSource }, callback);
    }

    getDynamicView(config, otherProps) {
        const { dataSource } = this.state;
        return DynamicComponent.getDynamicView(dataSource, config, otherProps);
    }

    static getDynamicView(source, config, otherProps) {
        const { componentType, mapPropertyValueToProp, props = {} } = config;
        const { property, ...otherRootProps } = props;

        const componentWrapper = {
            component: DynamicComponentIndex.get(componentType)
        };

        const mappedPropertyValue = {
            [mapPropertyValueToProp || 'property']: (property ? get(source, property) : property)
        };

        return !componentWrapper.component ? null : (
            <componentWrapper.component source={source} {...mappedPropertyValue} {...otherRootProps} {...otherProps} />
        );
    }
};

export default DynamicComponent;
