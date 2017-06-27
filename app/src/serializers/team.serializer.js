'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

var teamSerializer = new JSONAPISerializer('team', {
    attributes: [
        'name', 'managers', 'users', 'areas', 'createdAt'
    ],
    resource: {
        attributes: ['type', 'content']
    },
    typeForAttribute: function (attribute) {
        return attribute;
    },
    keyForAttribute: 'camelCase'
});

class TeamSerializer {
    static serialize(data) {
        return teamSerializer.serialize(data);
    }
}

module.exports = TeamSerializer;
