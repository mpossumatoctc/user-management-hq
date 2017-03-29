import Uuid from 'uuid';

import Action from 'd2-ui/lib/action/Action';

import schemaStore from '../schema/schema.store';
import Synthetic from '../expressions/synthetic';

const actions = Action.createActionsFromNames([
    'search',
    'searchResults'
]);

let currentSearchId = null;

actions.search
    .debounce(250)
    .map(context => {
        context.searchText = context.data;

        const searchableSections = context.searchableSections = schemaStore.getState().searchableSections;
        context.data = !context.data ? [] : searchableSections.map(section => {
            const searchModel = section.searchModel = section.model.clone();
            section.search.filters.forEach(filter => {
                searchModel.filters.add(Synthetic.createD2ModelFilter(filter, context.data));
            });
            return section;
        });

        currentSearchId = context.identifier = Uuid.v1();

        return context;
    })
    .subscribe(({ identifier, searchableSections, searchText, data, complete, error }) => {
        if (data.length === 0) {
            searchableSections.forEach(section => delete section.searchModel);
            actions.searchResults({ state: 'cleared' });
            return complete();
        }

        const getSearchResultsObject = (text, state, sections, values) => sections.reduce((obj, section, index) => {
            obj[section.key] = values[index];
            return obj;
        }, { text, state });
        const promises = data.map(section => section.searchModel.list());

        actions.searchResults(getSearchResultsObject(searchText, 'pending', data, promises));

        return Promise.all(promises).then((collections) => {
            if (currentSearchId !== identifier) { // old search came back
                return complete();
            }

            const results = getSearchResultsObject(searchText, 'resolved', data, collections);

            actions.searchResults(results);

            complete();
        }, () => error());
    });

export default actions;
