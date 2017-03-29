// TODO: Remove completely and pull from data store - alpha purposes only
// Subject to change

const schema = {

    "i18n": {
        "en": {
            "sources": ["/i18n/en.properties"],
            "strings": {
                "$account_type": "Account Type",
                "$org_units": "Organisation Units",
                "$user_groups_count": "Groups",
                "$user_count": "Associated Users",
                "$ui_status": "Status",
                "$authorities_count": "Authorities"
            }
        }
    },

    "models": [{
        "key": "d2.ext.systemAuthorities",
        "specialClass": "GenericIdModelDefinition",
        "schema": {
            "name": "systemAuthority",
            "apiEndpoint": "/../dhis-web-maintenance-user/getSystemAuthorities.action",
            "plural": "systemAuthorities",
            "displayName": "System Authority",
            "collectionName": "systemAuthorities",
            "singular": "systemAuthority",
            "properties": [{
                "description": "The authority identifier for this Object.",
                "name": "id",
                "propertyType": "IDENTIFIER"
            }, {
                "description": "The name of this Object.",
                "name": "name",
                "propertyType": "TEXT"
            }]
        }
    }],

    "synthetics": [{
        "model": "user",
        "properties": {
            "$userGroupsCount": "this.userGroups.size",
            "$orgUnits": "this.organisationUnits.toArray().map(function (ou) { return ou.name; }).join(', ')",
            "$isPartner": "this.userGroups.toArray().some(function (ug) { return /^OU .+? (Partner) /i.test(ug.name); })",
            "$isAgency": "this.userGroups.toArray().some(function (ug) { return /^OU .+? (Agency) /i.test(ug.name); })",
            "$isInterAgency": "this.userGroups.toArray().some(function (ug) { return /^OU .+? Country team$/i.test(ug.name); })",
            "$isGlobal": "this.organisationUnits.toArray().some(function (ou) { return ou.name === 'Global'; })",
            "$accountType": "this.$isPartner ? 'Partner' : this.$isAgency ? 'Agency' : this.$isInterAgency ? 'Inter-Agency' : this.$isGlobal ? 'Global' : 'Unknown'",
            "$uiIcon": "this.userCredentials.disabled ? 'block' : 'directions_run'",
            "$uiStatus": "React.createElement('i', { className: 'material-icons', style: { color: (this.$uiIcon === 'block' ? 'red' : 'green') } }, this.$uiIcon)",
            "$headerSubtitle": "[this.$accountType, ' user in ', this.$orgUnits || 'unknown country'].join('')"
        }
    }, {
        "model": "userGroup",
        "properties": {
            "$userCount": "this.users ? this.users.size : 'Unknown'"
        }
    }, {
        "model": "userRole",
        "properties": {
            "$userCount": "this.users ? this.users.size : 'Unknown'",
            "$authoritiesCount": "this.authorities.length"
        }
    }],

    "views": [{
        "model": "user",
        "componentType": "DetailsComponent",
        "props": {
            "headerProps": {
                "title": "name",
                "subtitle": "$headerSubtitle"
            },
            "children": [{
                "componentType": "MatrixViewComponent",
                "props": {
                    "matrix": "user_data_streams"
                }
            }, {
                "componentType": "ModelCollectionComponent",
                "props": {
                    "property": "userCredentials.userRoles",
                    "subheader": "Roles",
                    "sorter": "StringComparer",
                    "listItemProps": {
                        "insetChildren": true
                    }
                }
            }, {
                "componentType": "ModelCollectionComponent",
                "props": {
                    "property": "userGroups",
                    "subheader": "Groups",
                    "sorter": "StringComparer",
                    "listItemProps": {
                        "insetChildren": true
                    }
                }
            }]
        }
    }, {
        "model": "userGroup",
        "componentType": "DetailsComponent",
        "props": {
            "headerProps": {
                "title": "name",
                "subtitle": "Group"
            },
            "children": [{
                "componentType": "ModelCollectionComponent",
                "props": {
                    "property": "users",
                    "subheader": "Users",
                    "sorter": "StringComparer",
                    "listItemProps": {
                        "insetChildren": true
                    }
                }
            }]
        }
    }],

    "sections": [{
        "key": "users",
        "label": "Users",
        "icon": "group",
        "model": "user",
        "fields": ["surname", "firstName", "$userGroupsCount", "$orgUnits", "$accountType", "$uiStatus"],
        "params": {
            "order": "surname,firstName",
            "fields": ":all,userCredentials[:owner,!userGroupAccesses,userRoles[id,name,displayName]],!userGroupAccesses,userGroups[id,name,displayName],organisationUnits[id,name]"
        },
        "search": {
            "filters": [{
                "propertyName": "name",
                "comparator": "ilike",
                "filterValue": "this"
            }]
        },
        "sections": [{
            "key": "users_active_users",
            "label": "Active Users",
            "icon": "directions_run",
            "filters": [{
                "propertyName": "userCredentials.disabled",
                "comparator": "eq",
                "filterValue": "false"
            }]
        }, {
            "key": "users_disabled_users",
            "label": "Disabled Users",
            "icon": "block",
            "filters": [{
                "propertyName": "userCredentials.disabled",
                "comparator": "eq",
                "filterValue": "true"
            }]
        }]
    }, {
        "key": "groups",
        "label": "Groups",
        "icon": "group_work",
        "model": "userGroup",
        "fields": ["name", "$userCount", "lastUpdated"],
        "params": {
            "fields": ":owner,users[id,name,displayName]"
        },
        "search": {
            "filters": [{
                "propertyName": "name",
                "comparator": "ilike",
                "filterValue": "this"
            }]
        }
    }, {
        "key": "roles",
        "label": "Roles",
        "icon": "assignment_ind",
        "model": "userRole",
        "fields": ["name", "description", "$userCount", "$authoritiesCount"],
        "search": {
            "filters": [{
                "propertyName": "name",
                "comparator": "ilike",
                "filterValue": "this"
            }]
        },
        "sections": [{
            "key": "roles_authorities",
            "label": "Authorities",
            "icon": "vpn_key",
            "model": "d2.ext.systemAuthorities",
            "fields": ["name"],
            "search": null,
            "requires": [
                //"d2.currentUser"
            ]
        }]
    }],

    "matrices": [{
        "key": "user_data_streams",
        "name": "Data Streams",
        "model": "user",
        "headers": ["Stream", "Access", "Data Entry"],
        "definition": {
            "SI": [
                "this.userGroups.toArray().filter(function (ug) { return ug.name === 'Data SI access'; })",
                "this.userCredentials.userRoles.filter(function (ur) { return /^Data Entry SI\\b/i.test(ur.name); })"
            ],
            "EA": [
                "this.userGroups.toArray().filter(function (ug) { return ug.name === 'Data EA access'; })",
                "this.userCredentials.userRoles.filter(function (ur) { return /^Data Entry EA\\b/i.test(ur.name); })"
            ],
            "SIMS": [
                "this.userGroups.toArray().filter(function (ug) { return ug.name === 'Data SIMS access'; })",
                "this.userCredentials.userRoles.filter(function (ur) { return /^Data Entry SIMS\\b/i.test(ur.name); })"
            ],
            "SIMS Key Populations": [
                "this.userGroups.toArray().filter(function (ug) { return ug.name === 'Data SIMS Key Populations'; })",
                "this.userCredentials.userRoles.filter(function (ur) { return /^Data Entry SIMS Key Populations\\b/i.test(ur.name); })"
            ]
        }
    }]

};

export default schema;
