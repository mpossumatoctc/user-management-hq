import Action from 'd2-ui/lib/action/Action';

import ModelDefinition from 'd2/lib/model/ModelDefinition';
import { getInstance as getD2 } from 'd2/lib/d2';

import schemaStore from './schema.store';
import modelDefinitions from '../model';
import Synthetic from '../expressions/synthetic';

const actions = Action.createActionsFromNames([
    'init'
]);

actions.init.subscribe(({ complete, error }) => {
    getD2()
        .then(d2 => {
            return Promise.all([
                // HACK: Do not mutate d2
                d2.currentUser.getUserRoles().then(roles => d2.currentUser.userRoles = roles.toArray()),
                d2.currentUser.getUserGroups().then(groups => d2.currentUser.userGroups = groups.toArray()),
                d2.currentUser.getOrganisationUnits().then(units => d2.currentUser.organisationUnits = units.toArray())
            ]).then(() => d2);
        })
        .then(d2 => new Promise((resolve, reject) => {
            const defaultSchema = { models: [], sections: [], searchableSections: [] };

            // TODO: Schema should come from data store - not local
            const customSchema = require('../schema').default;
            const schema = Object.assign(defaultSchema, customSchema);

            //
            // TODO: Clean me up ...all of this...
            //

            // Load custom models
            const customModels = schema.models.reduce((models, definition) => {
                const { key, specialClass, schema } = definition;
                const klass = modelDefinitions[specialClass];

                if (klass) {
                    ModelDefinition.specialClasses[schema.name] = klass;
                }

                models[key] = ModelDefinition.createFromSchema(schema);
                return models;
            }, {});

            // Load synthetics
            schema.synthetics = (schema.synthetics || []).reduce((synthetics, definition) => {
                const { model, properties } = definition;
                synthetics[model] = Object.keys(properties).map(propertyName => new Synthetic(propertyName, properties[propertyName]));
                return synthetics;
            }, {});

            // Load Views
            schema.views = (schema.views || []).reduce((views, definition) => {
                const { model } = definition;
                views[model] = definition;
                return views;
            }, {});

            // Load Matrices
            schema.matrices = (schema.matrices || []).reduce((matrices, matrix) => {
                const { definition = {} } = matrix;

                Object.keys(definition).forEach(key => {
                    definition[key] = definition[key].map(expression => Synthetic.createFunction(expression));
                });

                matrices[matrix.key] = matrix;
                return matrices;
            }, {});

            // Process section nodes
            const process = (context, current, childPropertyName) => {
                if (current.requires && current.requires.length > 0) {
                    const isValid = current.requires.every(expr => Synthetic.createFunction(expr, {})());
                    if (!isValid) {
                        return null;
                    }
                }

                const currentContext = Object.assign({}, context, current);
                delete currentContext[childPropertyName];

                // Merge missing properties from parent to current
                Object.keys(currentContext).forEach((key) => (current[key] = (current[key] || currentContext[key])));

                // Attach model
                const model = current.model ? (d2.models[current.model] || customModels[current.model]) : current.model;
                current.model = model.clone();

                // Assign base filters to model
                (current.filters || []).forEach(filter => current.model.filters.add(Synthetic.createD2ModelFilter(filter)));

                // Store if searchable section
                if (current.search) {
                    schema.searchableSections.push(current);
                }

                const children = current[childPropertyName];
                if (children && Array.isArray(children) && children.length > 0) {
                    current[childPropertyName] =
                        children.map(child => process(currentContext, child, childPropertyName)).filter(c => c !== null);
                }

                return current;
            };

            schema.sections = schema.sections.map(s => process({}, s, 'sections')).filter(s => s !== null);
            schemaStore.setState(schema);

            resolve({ d2, schema });
        }))
        .then(context => {
            const { d2, schema } = context;
            const { uiLocale } = d2.currentUser;
            const i18n = (schema.i18n || {})[uiLocale];

            if (!i18n) { return context; }

            if (i18n.sources) {
                i18n.sources.forEach(source => d2.i18n.addSource(source));
            }

            return d2.i18n.load().then((...args) => {
                // HACK: Write to translations object?
                Object.keys(i18n.strings || {}).forEach(key => d2.i18n.translations[key] = i18n.strings[key]);
            });
        })
        .then(complete);
});

export default actions;
