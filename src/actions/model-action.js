
class ModelAction {
    isApplicable(dataModelDefinition) {
        return false;
    }

    getActions(item) {
        return {};
    }

    getIcons(item) {
        return {};
    }

    getWrappedActions(item, beforeInvoke, afterInvoke) {
        const actions = this.getActions(item) || {};

        const wrappedActions = Object.keys(actions).reduce((wrappedActions, key) => {
            wrappedActions[key] = (...args) => {
                if (beforeInvoke) { beforeInvoke(); }

                return actions[key](...args).then(data => {
                    if (afterInvoke) { afterInvoke(null, data); }
                    return data;
                }, err => {
                    if (afterInvoke) { afterInvoke(err); }
                    return err;
                });
            };
            return wrappedActions;
        }, {});

        return wrappedActions;
    }
}

export default ModelAction;
