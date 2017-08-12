var express = require('express');
var router = express.Router();
var User = require('../models/userModel');

var jwt = require('jsonwebtoken');
var _settings = require('../_settings');
var jwtSecret = _settings.secret;

// Unprotected routes
router.get('/', function (req, res) {
    /**
     *  @api {get} /api/   Display API introduction page
     *  @apiName  GetIntro
     */
    res.json({message: 'Welcome to the RESTful API! Please authenticate to proceed.'});
});

router.route('/authenticate')
    /**
     *  @api {post} /api/authenticate/  Perform user authentication
     *  @apiName  PostAuthenticate
     *  @apiParam {String}  name  Login Name
     *  @apiParam {String}  password  Login Password
     */
    .post(function (req, res) {
        console.log('++' + req.body.password + '\n');
        if (!req.body.name || !req.body.password) {
            return res.status(401).json({success: false, message: 'Please provide Name and Password for authentication.'});
        }
        req.body.name = req.body.name.trim();
        req.body.password = req.body.password.trim();
        var query = {'name': req.body.name};
        User.findOne(query, function (error, user) {
            if (error) {
                throw error;
            };

            if (!user) {
                res.status(400).json({success: false, message: 'Authentication failed. User not found.'});
            }

            if (user) { // user found
                // check password
                if (!user.isValidPassword(req.body.password, user)) {
                    // Wrong password
                    res.status(401).json({success: false, message: 'Authentication failed. Wrong password.'});
                } else {
                    // Correct password. Create token
                    var token = jwt.sign(user, jwtSecret, {
                        expiresIn: 86400    // expires in 24 hours (24x60x60)
                    });

                    // var user = user.toObject();
                    user.token = token;
                    console.log(user);

                    user.save(function (error) {
                        if (error) {
                            throw error;
                        }
                        console.log('++ Token saved to user.');
                    });
                    res.json({success: true, message: 'Token provided', token: token});
                }
            }
        });
    })
    .all(function (req, res) {
        res.status(405).json({success: false, message: 'Please use POST method to authenticate.'});
    });

// Middleware to check for token authentication
//
router.use(function (req, res, next) {
    // check POST body or url parameters or header for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (token) {
        // token found, verify secret and check expiry
        jwt.verify(token, jwtSecret, function (error, decoded) {
            // error in token
            if (error) {
                return res.status(403).json({
                    success: false, message: 'Failed to authenticate token.'
                });
            }

            // if token good, save to request for use in protected routes
            req.decoded = decoded;
            req.user = decoded._doc;  // add authorised user information to request

            next(); // drop to next route
        });
    } else {
        // token not found
        return res.status(401).send({success: false, message: 'No token found.'});
    }
});

// Protected routes below

// define API sub-routes here
var userRoutes = require('./users/userRoutes');
router.use('/users', userRoutes);
/*
var zwaveRoutes = require();
router.use('/zwave', zwaveRoutes);
*/
module.exports = router;
