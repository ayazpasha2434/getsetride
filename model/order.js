/**
 * Created by ayaz.p on 12/12/15.
 */

var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    delivery_timing: String,
    job_id: Number,
    customer_name: String,
    phone_number: Number,
    date: String,
    rider_name: String,
    rider_number: Number,
    order_status: String,
    trip_distance: Number,
    remarks: String,
    hub_name: String
});

mongoose.model('Order', orderSchema, 'order_data');