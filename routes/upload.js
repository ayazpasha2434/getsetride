/**
 * Created by ayaz.p on 24/12/15.
 */

var express = require('express')
    , router = express.Router()
    , multer = require('multer')
    , formidable = require('formidable')
    , http = require('http')
    , util = require('util')
    , fs = require('fs')
    , sys = require('sys')
    , exec = require('child_process').exec;

var uploading = multer({
        dest: __dirname + '/public/uploads/'
    });

/*router.post('/upload', uploading, function(req, res) {

});*/

router.route('/')
    .get(function(req, res, next) {

        res.render('upload/index');
    })
    .post(function(req, res, next) {

        var form = new formidable.IncomingForm();

        // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.

        form.parse(req, function(err, fields, files) {
            if (err) {

                // Check for and handle any errors here.

                console.error(err.message);
                return;
            }

            console.log('upload '+ ' ' +JSON.stringify(files.dataFile.path));

            fs.readFile(files.dataFile.path, function (err, data) {

                console.log(JSON.stringify(files.dataFile));
                if(!err) {

                    var newPath = __dirname + "/uploads/" + files.dataFile.name;

                    fs.writeFile(newPath, data, function (err) {

                        var success = 'true';
                        var message = 'Success!';
                        console.log(newPath+ ' ' +err);

                        // This last line responds to the form submission with a list of the parsed data and files.
                        exec("mongoimport -d getsetride -c order_data --type csv --file "+ __dirname+"/uploads/"+files.dataFile.name+"  --headerline", function (error, stdout, stderr) {

                            sys.print('stdout: ' + stdout);
                            sys.print('stderr: ' + stderr);

                            if (error !== null) {
                                message = 'Error!, Error: '+error+'\n'+stdout+'\n'+stderr;
                                success = 'false';
                                console.log('exec error: ' + error);
                            } else {

                                message += stdout+'\n'+stderr;
                            }

                            res.render('upload/index',{
                                "title": 'Upload data',
                                "message": message,
                                "fileName" : files.dataFile.name,
                                "success": success
                            });

                        });

                        //res.end(util.inspect({fields: fields, files: files}));
                    });
                } else {

                    res.render('upload/index',{
                        "title": 'Upload data',
                        "message": 'Error!, Error: '+err,
                        "fileName" : files.dataFile.name,
                        "success": 'false'
                    });
                }
            });

        });

    })

/*router.route('/', function(req, res) {

    res.render('/upload/index');
});*/

module.exports = router;
