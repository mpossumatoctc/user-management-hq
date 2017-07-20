import UserActions from './users/user-actions';

const modelActions = [];

const registerModelActions = (...actions) =>
    actions.forEach(action => modelActions.push(action));

const getModelAction = (dataModelDefinition) =>
    modelActions.filter(action => action.isApplicable(dataModelDefinition))[0];


registerModelActions(
    new UserActions()
);

export {
    registerModelActions,
    getModelAction
};
