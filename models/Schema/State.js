const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StateSchema = new Schema({
    stateName : { type: String }
})

const StateModel = mongoose.model('allStates', StateSchema);

module.exports = {StateSchema, StateModel}