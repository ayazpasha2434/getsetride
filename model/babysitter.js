/**
 * Created by ayaz on 12/9/15.
 */

var mongoose = require('mongoose');
var blobSchema = new mongoose.Schema({
    name: String,
    address: String,
    categories: String,
    isVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isAddressVerified: { type: Boolean, default: false },
    businessModel: String,
    charges: String,
    dob: { type: Date, default: '01/01/1975' },
    dateEnrolled: { type: Date, default: Date.now },
    phone: String,
    locality: String,
    updatedAt: { type: Date, default: Date.now }
});

mongoose.model('Blob', blobSchema, 'babysitters');