/**
 * Created by ayaz on 12/9/15.
 */

var mongoose = require('mongoose');
var sittingSchema = new mongoose.Schema({
    babySitter: mongoose.Schema.Types.ObjectId,
    customer: mongoose.Schema.Types.ObjectId,
    date: { type: Date, default: Date.now },
    review: mongoose.Schema.Types.ObjectId,
    status: String,
    updatedAt: { type: Date, default: Date.now }
});

mongoose.model('Sitting', sittingSchema, 'sittings');