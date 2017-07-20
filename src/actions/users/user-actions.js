
import ModelAction from '../model-action';

class UserActions extends ModelAction {
    isApplicable(dataModelDefinition) {
        return dataModelDefinition.javaClass === 'org.hisp.dhis.user.User';
    }

    getActions(item) {
        const isMultiple = Array.isArray(item);

        if (isMultiple && item.length === 0) { return null; }

        const actions = {
            [isMultiple ? 'enableUsers' : 'enableUser']: this.enableUser.bind(this),
            [isMultiple ? 'disableUsers' : 'disableUser']: this.disableUser.bind(this)
        };

        if (!isMultiple) {
            const notApplicable = item.userCredentials.disabled ? 'disableUser' : 'enableUser';
            delete actions[notApplicable];
        }

        return actions;
    }

    getIcons(item) {
        return {
            enableUser: 'add',
            enableUsers: 'add',
            disableUser: 'block',
            disableUsers: 'block'
        };
    }

    getUserArray(user) {
        const users = (Array.isArray(user) ? user : [user]).map(u => ({
            id: u.id,
            surname: u.surname,
            firstName: u.firstName,
            userCredentials: {
                username: u.userCredentials.username,
                disabled: u.userCredentials.disabled
            }
        }));

        // Can't update yourself
        return users.filter(u => u.id !== d2.currentUser.id);
    }

    enableUser(user) {
        const users = this.getUserArray(user);
        if (users.length === 0) {
            return Promise.resolve();
        }

        users.forEach(u => u.userCredentials.disabled = false);

        const promise = d2.Api.getApi().post('metadata?importStrategy=UPDATE&mergeMode=MERGE', { users });

        return promise;
    }

    disableUser(user) {
        const users = this.getUserArray(user);
        if (users.length === 0) {
            return Promise.resolve();
        }

        users.forEach(u => u.userCredentials.disabled = true);

        const promise = d2.Api.getApi().post('metadata?importStrategy=UPDATE&mergeMode=MERGE', { users });

        return promise;
    }
}

export default UserActions;
