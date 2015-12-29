/**
 * Created by ayaz.p on 12/12/15.
 */

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

var db = require('../model/db');
var blobs = require('../model/order');

//build the REST operations at the base for babysitter
//this will be accessible from http://127.0.0.1:3000/babysitter if the default route for / is left unchanged
router.route('/')
    //GET all babysitter
    .get(function(req, res, next) {

        console.log(JSON.stringify(req.params) + ' ' +JSON.stringify(req.body)+ ' ' +JSON.stringify(req.query));

        var date = new Date();
        var today = date.getDate()+"/"+(date.getMonth() + 1)+"/"+date.getFullYear();

        var searchQuery = req.query.searchQuery || today;

        var perPage = 20
            , page = req.param('page') > 0 ? req.param('page') : 0

        var query = mongoose.model('Order')
            .find()
            .select('date job_id customer_name phone_number delivery_timing hub_name rider_name rider_number order_status trip_distance remarks')
            .limit(perPage)
            .skip(perPage * page)
            .sort({name: 'asc'});

        if(searchQuery !== undefined && searchQuery !== null && searchQuery !== "") {

            console.log(decodeURIComponent(searchQuery));
            query = mongoose.model('Order')
                .find({date: decodeURIComponent(searchQuery)})
                .select('date job_id customer_name phone_number delivery_timing hub_name rider_name rider_number order_status trip_distance remarks')
                .limit(perPage)
                .skip(perPage * page)
                .sort({name: 'asc'});
        }

        query.exec(function (err, orders) {

            console.log(orders);
            mongoose.model('Order').find({date: decodeURIComponent(searchQuery)}).count().exec(function (err, count) {
                res.render('order/index', {
                    orders: orders
                    , page: page
                    , pages: count / perPage
                })
            })

        });

        res.locals.createPagination = function (pages, page) {
            var url = require('url')
                , qs = require('querystring')
                , params = qs.parse(url.parse(req.url).query)
                , str = ''

            console.log(page+ " " + JSON.stringify(req.params));
            params.page = 0
            var clas = page == 0 ? "active" : "disabled"
            str += '<li class="disabled"><a href="?'+qs.stringify(params)+'" aria-label="Previous"><span aria-hidden="true">&laquo</span></a></li>'
            for (var p = 0; p < pages; p++) {
                var pg = parseInt(p, 10) + 1;
                params.page = p
                clas = page == p ? "active" : "disabled"
                str += '<li class="'+clas+'"><a href="?'+qs.stringify(params)+'">'+ pg +'<span class="sr-only">(current)</span></a></li>'
            }
            params.page = --p
            clas = page == params.page ? "active" : "disabled"
            str += '<li class="disabled"><a href="?'+qs.stringify(params)+'" aria-label="Next"><span aria-hidden="true">&raquo</span></a></li>'

            return str
        }

    })
    //POST a new blob
    .post(function(req, res) {

        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms

        var date = req.body.date;
        var job_id = req.body.job_id;
        var customer_name = req.body.customer_name;
        var phone_number = req.body.phone_number;
        var delivery_timing = req.body.delivery_timing;
        var hub_name = req.body.hub_name;
        var rider_name = req.body.rider_name;
        var rider_number = req.body.rider_number;
        var order_status = req.body.order_status;
        var trip_distance = req.body.trip_distance;
        var remarks = req.body.remarks;

        //call the create function for our database
        mongoose.model('Order').create({
            date : date,
            job_id : job_id,
            customer_name : customer_name,
            phone_number : phone_number,
            delivery_timing : delivery_timing,
            hub_name : hub_name,
            rider_name : rider_name,
            rider_number : rider_number,
            order_status : order_status,
            trip_distance : trip_distance,
            remarks : remarks
        }, function (err, order) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //Blob has been created
                console.log('POST creating new blob: ' + order);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("order");
                        // And forward to success page
                        res.redirect("/order");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(order);
                    }
                });
            }
        })
    });

/* GET New Blob page. */
router.get('/new', function(req, res) {
    res.render('order/new', { title: 'Add new Order' });
});

//GET the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the blob within Mongo

    mongoose.model('Order').findById(req.params.id, function (err, order) {
        console.log(JSON.stringify(order));
        if (err || order == undefined) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the blob
            console.log('GET Retrieving ID: ' + order._id);
            //format the date properly for the value to show correctly in our edit form

            /*var date = "";
            console.log(order.date);
            if(order.date != undefined && order.date != "") {

                date = order.date.toISOString();
                date = date.substring(0, date.indexOf('T'));
            }*/

            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                    res.render('order/edit', {
                        title: 'Order ' + order._id,
                        "date" : order.date,
                        "order" : order,
                        "rider_name" : order.rider_name
                    });
                },
                //JSON response will return the JSON output
                json: function(){
                    res.json(order);
                }
            });
        }
    });
});

router.route('/:id')
    .get(function(req, res) {
        mongoose.model('Order').findById(req.params.id, function (err, order) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + order._id);

                /*var blobdob = "";
                if(order.dob != undefined && order.dob != "") {
                    blobdob = order.dob.toISOString();
                    blobdob = blobdob.substring(0, blobdob.indexOf('T'))
                }*/

                res.format({
                    html: function(){
                        res.render('order/show', {
                            "blobdob" : order.date,
                            "order" : order
                        });
                    },
                    json: function(){
                        res.json(order);
                    }
                });
            }
        });
    });

//PUT to update a blob by ID
router.post('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var date = req.body.date;
    var job_id = req.body.job_id;
    var customer_name = req.body.customer_name;
    var phone_number = req.body.phone_number;
    var delivery_timing = req.body.delivery_timing;
    var hub_name = req.body.hub_name;
    var rider_name = req.body.rider_name;
    var rider_number = req.body.rider_number;
    var order_status = req.body.order_status;
    var trip_distance = req.body.trip_distance;
    var remarks = req.body.remarks;

    //find the document by ID
    mongoose.model('Order').findById(req.params.id, function (err, order) {
        //update it
        order.update({
            date : date,
            job_id : job_id,
            customer_name : customer_name,
            phone_number : phone_number,
            delivery_timing : delivery_timing,
            hub_name : hub_name,
            rider_number : rider_number,
            rider_name : rider_name,
            order_status : order_status,
            trip_distance : trip_distance,
            remarks : remarks
        }, function (err, order) {

            console.log(JSON.stringify(order));
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            }
            else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.format({
                    html: function(){
                        res.redirect("/order/" + req.params.id);
                    },
                    //JSON responds showing the updated values
                    json: function(){
                        res.json(order);
                    }
                });
            }
        })
    });
});

//DELETE a Blob by ID
router.delete('/:id/edit', function (req, res){
    //find blob by ID
    mongoose.model('Order').findById(req.id, function (err, order) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            order.remove(function (err, order) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + order._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                        html: function(){
                            res.redirect("/order");
                        },
                        //JSON returns the item with the message that is has been deleted
                        json: function(){
                            res.json({message : 'deleted',
                                item : order
                            });
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;