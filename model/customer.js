/**
 * Created by ayaz on 12/9/15.
 */

var mongoose = require('mongoose');
var customerSchema = new mongoose.Schema({
    name: String,
    address: String,
    locality: String,
    isVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    phone: String,
    updatedAt: { type: Date, default: Date.now }
});

mongoose.model('Customer', customerSchema, 'customers');