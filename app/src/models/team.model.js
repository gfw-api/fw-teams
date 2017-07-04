'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Team = new Schema({
    name: { type: String, required: false, trim: true },
    managers: { type: Array, default: [] },
    users: { type: Array, default: [] },
    areas: { type: Array, default: [] },
    layers: { type: Array, default: [] },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Team', Team);
