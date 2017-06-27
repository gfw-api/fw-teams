'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Team = new Schema({
    name: { type: String, required: false, trim: true },
    managers: [{ type: String, trim: true }],
    users: [{ type: String, trim: true }],
    areas: [{ type: String, trim: true }]
});

module.exports = mongoose.model('Team', Team);
