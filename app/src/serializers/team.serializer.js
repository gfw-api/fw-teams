'use strict';

var logger = require('logger');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;

var teamSerializer = new JSONAPISerializer('team', {
    attributes: [
        'name', 'managers', 'users', 'areas', 'layers', 'confirmedUsers', 'createdAt'
    ],
    managers: {
      attributes: ['email', 'id']
    },
    confirmedUsers: {
      attributes: ['email', 'id']
    },
    keyForAttribute: 'camelCase'
});

class TeamSerializer {
    static serialize(data) {
        return teamSerializer.serialize(data);
    }
}

module.exports = TeamSerializer;
