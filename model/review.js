/**
 * Created by ayaz on 12/9/15.
 */

var mongoose = require('mongoose');
var reviewSchema = new mongoose.Schema({
    comment: String,
    babySitter: mongoose.Schema.Types.ObjectId,
    customer: mongoose.Schema.Types.ObjectId,
    updatedAt: { type: Date, default: Date.now }
});

mongoose.model('Review', reviewSchema, 'reviews');