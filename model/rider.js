/**
 * Created by ayaz.p on 12/12/15.
 */

var mongoose = require('mongoose');

var riderSchema = new mongoose.Schema({
    rider_name: String,
    rider_number: Number
});

mongoose.model('Rider', riderSchema, 'rider_data');