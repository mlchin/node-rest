var express = require('express');
var router = express.Router();

var fs = require('fs');
var _settings = require('../_settings');
var User = require('../models/userModel');

router.get('/', function (req, res) {
    /**
     *  @api {get} /setup/  Run Application First time Setup
     *  @apiName GetSetupApp
     */
    fs.readFile('./setup.txt', 'utf-8', function (error) {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log('++ File not found');
                // proceed to create admin
                // need to clear db first
                User.collection.drop(); // drop the Users collection

                // create admin user
                var admin = new User();

                admin.name = _settings.admin.name;
                admin.password = admin.genHash(_settings.admin.password);
                admin.admin = true;
                admin.token = '';

                admin.save(function (error) {
                    if (error) {
                        throw error;
                    };
                    console.log('++ Admin saved to database.');
                });
                // create one time setup file
                fs.openSync('./setup.txt', 'w');

                res.json({success: true, message: 'First time setup completed.', user: admin});
            } else {
                console.log('++ Other error');
                throw error;
            }
        } else {
            // File found
            console.log('++ File found');
            res.status(403).json({success: false, message: 'Already setup. Cannot run again.'});
        }
    });
});

// check for token
// check for master admin
// create route /setup/reset

module.exports = router;
