'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

var teamSerializer = new JSONAPISerializer('team', {
    attributes: [
        'name', 'managers', 'users', 'areas', 'layers', 'createdAt'
    ],
    resource: {
        attributes: ['type', 'content']
    },
    keyForAttribute: 'camelCase'
});

class TeamSerializer {
    static serialize(data) {
        return teamSerializer.serialize(data);
    }
}

module.exports = TeamSerializer;
