// get instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

// setup user model
var userSchema = Schema({

    name: String,
    password: String,
    admin: Boolean,
    token: String

});

// generate a hash
userSchema.methods.genHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//check if password is valid - returns boolean
userSchema.methods.isValidPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model
module.exports = mongoose.model('User', userSchema);
