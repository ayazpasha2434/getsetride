/**
 * Created by ayaz on 12/9/15.
 */

var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

var db = require('../model/db');
var blobs = require('../model/review');

//build the REST operations at the base for babysitter
//this will be accessible from http://127.0.0.1:3000/babysitter if the default route for / is left unchanged
router.route('/')
    //GET all babysitter
    .get(function(req, res, next) {

        var perPage = 20
            , page = req.param('page') > 0 ? req.param('page') : 0

        mongoose.model('Blob')
            .find()
            .select('name categories phone isVerified locality')
            .limit(perPage)
            .skip(perPage * page)
            .sort({name: 'asc'})
            .exec(function (err, blobs) {
                mongoose.model('Blob').count().exec(function (err, count) {
                    res.render('babysitters/index', {
                        blobs: blobs
                        , page: page
                        , pages: count / perPage
                    })
                })
            });

        //retrieve all babysitter from Monogo
        /*mongoose.model('Blob').find({}, function (err, babysitter) {
            if (err) {
                return console.error(err);
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                console.log(JSON.stringify(babysitter));
                res.format({
                    //HTML response will render the index.jade file in the views/babysitter folder. We are also setting "babysitter" to be an accessible variable in our jade view
                    html: function(){
                        res.render('babysitter/index', {
                            title: 'All my Blobs',
                            babysitter : babysitter
                        });
                    },
                    //JSON response will show all babysitter in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
            }
        });*/


        /*res.locals.createPagination = function (pages, page) {
            var url = require('url')
                , qs = require('querystring')
                , params = qs.parse(url.parse(req.url).query)
                , str = ''

            params.page = 0
            var clas = page == 0 ? "active" : "no"

            if(clas === "no")
                str += '<a href="?'+qs.stringify(params)+'">First</a> '
            else
                str += 'First '

            for (var p = 1; p < pages; p++) {
                params.page = p
                clas = page == p ? "active" : "no"

                if(clas === "no")
                    str += '<a href="?'+qs.stringify(params)+'">'+ p +'</a> '
                else
                    str += p +' '
            }
            params.page = --p
            clas = page == params.page ? "active" : "no"

            if(clas === "no")
                str += '<a href="?'+qs.stringify(params)+'">Last</a>'
            else
                str += 'Last'

            return str
        }*/

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
        var name = req.body.name;
        var address = req.body.address;
        var phone = req.body.phone;
        var categories = req.body.categories;
        var dob = req.body.dob;
        var dateEnrolled = req.body.dateEnrolled;
        var isVerified = req.body.isVerified;

        //call the create function for our database
        mongoose.model('Blob').create({
            name : name,
            address : address,
            dob : dob,
            isVerified : isVerified,
            phone : phone,
            dateEnrolled : dateEnrolled,
            categories : categories
        }, function (err, blob) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //Blob has been created
                console.log('POST creating new blob: ' + blob);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("blobs");
                        // And forward to success page
                        res.redirect("/babysitter");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(blob);
                    }
                });
            }
        })
    });

/* GET New Blob page. */
router.get('/new', function(req, res) {
    res.render('babysitters/new', { title: 'Add New Blob' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Blob').findById(id, function (err, blob) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404);
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                }
            });
            //if it is found we continue on
            } else {
                //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
                //console.log(blob);
                // once validation is done save the new item in the req
                req.id = id;
                // go to the next thing
                next();
            }
        });
    });

router.route('/:id')
    .get(function(req, res) {
        mongoose.model('Blob').findById(req.id, function (err, blob) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + blob._id);
                console.log(blob.dob);
                var blobdob = "";
                if(blob.dob != undefined && blob.dob != "") {
                    blobdob = blob.dob.toISOString();
                    blobdob = blobdob.substring(0, blobdob.indexOf('T'))
                }
                res.format({
                    html: function(){
                        res.render('babysitters/show', {
                            "blobdob" : blobdob,
                            "blob" : blob
                        });
                    },
                    json: function(){
                        res.json(blob);
                    }
                });
            }
        });
    });

//GET the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the blob within Mongo
    mongoose.model('Blob').findById(req.id, function (err, blob) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the blob
            console.log('GET Retrieving ID: ' + blob._id);
            //format the date properly for the value to show correctly in our edit form

            var blobdob = "";
            console.log(blob.dob);
            if(blob.dob != undefined && blob.dob != "") {

                blobdob = blob.dob.toISOString();
                blobdob = blobdob.substring(0, blobdob.indexOf('T'))
            }

            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                    res.render('babysitters/edit', {
                        title: 'Blob' + blob._id,
                        "blobdob" : blobdob,
                        "blob" : blob
                    });
                },
                //JSON response will return the JSON output
                json: function(){
                    res.json(blob);
                }
            });
        }
    });
});

//PUT to update a blob by ID
router.post('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var phone = req.body.phone;
    var dob = req.body.dob;
    var address = req.body.address;
    var isVerified = req.body.isVerified;
    var locality = req.body.locality;
    var categories = req.body.categories;

    //find the document by ID
    mongoose.model('Blob').findById(req.params.id, function (err, blob) {
        //update it
        blob.update({
            name : name,
            phone : phone,
            dob : dob,
            isVerified : isVerified,
            address : address,
            locality : locality,
            categories : categories
        }, function (err, blobID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            }
            else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.format({
                    html: function(){
                        res.redirect("/babysitters/" + blob._id);
                    },
                    //JSON responds showing the updated values
                    json: function(){
                        res.json(blob);
                    }
                });
            }
        })
    });
});

//DELETE a Blob by ID
router.delete('/:id/edit', function (req, res){
    //find blob by ID
    mongoose.model('Blob').findById(req.id, function (err, blob) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            blob.remove(function (err, blob) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + blob._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                        html: function(){
                            res.redirect("/babysitter");
                        },
                        //JSON returns the item with the message that is has been deleted
                        json: function(){
                            res.json({message : 'deleted',
                                item : blob
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/link1', function(req, res) {

    res.render('/babysitters/link1');
});

router.get('/link2', function(req, res) {

    res.render('/babysitters/link2');
});

module.exports = router;