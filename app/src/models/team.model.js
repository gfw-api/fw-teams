
const mongoose = require('mongoose');

const { Schema } = mongoose;

const Team = new Schema({
    name: { type: String, required: false, trim: true },
    managers: { type: Array, default: [] },
    users: { type: Array, default: [] },
    sentInvitations: { type: Array, default: [] },
    areas: { type: Array, default: [] },
    layers: { type: Array, default: [] },
    confirmedUsers: { type: Array, default: [] },
    createdAt: { type: Date, required: true, default: Date.now }
});

module.exports = mongoose.model('Team', Team);
