var _settings = require('../../_settings');

var express = require('express');
var router = express.Router();
var User = require('../../models/userModel');

//var jwt = require('jsonwebtoken');
//var superSecret = _settings.secret;

/**
 *  In order to access this route, the user must have valid token
 */
// All users are allowed to access routes below
router.get('/', function (req, res) {
    /**
     *  @api  {get} /api/users/  Display details of all users in the DB
     *  @apiName  GetUsers
     *
     *  @apiDescription All users with any access level is allowed to access this route
     */
    console.log('\n++ Calling user Name: ' + req.user.name + ',' +
        ' Admin Status: ' + req.user.admin + '\n');
    var query = {}; // find all users
    User.find(query, function (error, users) {
        res.json(users);
    });
});

router.get('/:userName', function (req, res) {
    /**
     *  @api  {get} /api/users/:username  Display details of the single user
     *  @apiName  GetUser
     *
     *  @apiDescription All users with any access level is allowed to access this route
     */
    var query = {'name': req.params.userName};
    User.findOne(query, function (error, user) {
        if (error) {
            throw error;
        }
        if (!user) {
            res.status(400).json({success: false, message: 'User not found.'});
        }
        if (user) {
            res.json({success: true, message: user});
        }
    });

});

// Only users with admin access are allowed to access routes below
router.use(function (req, res, next) {
    if (!req.user.admin) {
        return res.status(403).json({
            success: false, message: 'Only admin users can executed the requested action.'
        });
    }
    next(); // if is admin proceed to protected routes
});

router.route('/')
    .post(function (req, res) {
    /**
     *  @api  {post} /api/users/  Create new user in DB
     *  @apiName  PostUser
     *  @apiParam {String}  name  Name of new user
     *  @apiParam {String}  password  Password of new user
     *
     *  @apiDescription Only users with Admin level access is allowed to access this route
     */
        if (!req.body.name || !req.body.password) {
            // error - name or password not provided or blank
            res.status(401).json({
                success: false, message: 'Incomplete information. Name and/or Password not provided.'
            });
        } else {
            // proceed to create user in DB
            req.body.name = req.body.name.trim();
            req.body.password = req.body.password.trim();
            var query = {'name': req.body.name};
            User.findOne(query, function (error, user) {
                if (error) {
                    throw error;
                }
                if (user) {
                    res.status(400).json({
                        success: false, message: 'Cannot create. User name already exist.'
                    });
                    return;
                }
                if (!user) {
                    var newUser = new User();
                    newUser.name = req.body.name;
                    newUser.password = newUser.genHash(req.body.password);
                    newUser.admin = req.body.admin || false;    // default create non-admin user
                    newUser.token = '';

                    newUser.save(function (error) {
                        if (error) {
                            throw error;
                        }
                        console.log('++ New User saved to database.');
                        res.status(201).json({success: true, message: 'User created.'});
                    });
                }
            });
        }
    })
    .all(function (req, res) {
        res.status(405).json({success: false, message: 'This route accepts GET and POST only.'});
    });

router.route('/:userName')
    .put(function (req, res) {
    /**
     *  @api  {put} /api/users/:username   Modify existing user details
     *  @apiName  PutUser
     *  @apiParam {String}  username  Name of user to modify
     *  @apiParam {String}  name      Optional Change to new name
     *  @apiParam {String}  password  Optional Change to new password
     *  @apiParam {Boolean} admin     Optional Change to new access level
     * 
     *  @apiDescription   Only users with Admin level access is allowed to access this route
     */
        //console.log('\n' + require('util').inspect(req) + '\n');
        if (req.params.userName === _settings.admin.name) {
            return res.status(403).json({success: false, message: 'Cannot modify master administrator.'});
        };
        var query = {'name': req.params.userName};
        User.findOne(query, function (error, user) {
            if (error) {
                throw error;
            }
            if (!user) {
                res.status(400).json({success: false, message: 'User not found.'});
            }
            if (user) {
                user.name = req.body.name || req.query.name || user.name;
                user.name = user.name.trim();
                user.password = req.body.password || req.query.password || user.password;
                user.password = user.genHash(user.password.trim()); // cannot be undefined before trim
                user.admin = req.body.admin || req.query.admin || user.admin;

                user.save(function (error) {
                    if (error) {
                        throw error;
                    }
                    console.log('++ User data modified.');
                    res.json({success: true, message: 'User data successfully updated.'});
                });
            }
        });
    })
    .delete(function (req, res) {
    /**
     *  @api  {delete} /api/users/:username  Delete user
     *  @apiName  DeleteUser
     *
     *  @apiDescription Only users with Admin level access is allowed to access this route
     */
        if (req.params.userName === _settings.admin.name) {
            return res.status(403).json({success: false, message: 'Cannot delete master administrator.'});
        };
        var query = {'name': req.params.userName};
        User.findOneAndRemove(query, function (error, user) {
            if (error) {
                throw error;
            }
            if (!user) {
                res.status(400).json({success: false, message: 'User not found.'});
            }
            if (user) {
                user.remove(function (error) {
                    if (error) {
                        throw error;
                    }
                    console.log('User ' + user.name + 'successfully deleted.');
                    res.json({success: true, message: 'User successfully deleted!'});
                });
            }
        });
    })
    .all(function (req, res) {
        res.status(405).json({success: false, message: 'This route accepts GET, PUT and DELETE only.'});
    });

module.exports = router;

/*
post - create
get - read
put - update/replace
patch - update/modify
delete - delete

router.route('/login')

    .get(function(req, res){
        res.json({ status: true });
    })

    .post(function(req, res){
        res.json({});
    });


        passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));


*/
