// get instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// setup user model
var zwaveNodeSchema = Schema({

    manufacturer: String,
    manufacturerid: String,
    product: String,
    producttype: String,
    productid: String,
    type: String,
    name: String,
    loc: String,
    classes: Object,
    ready: Boolean

});

// create the model
module.exports = mongoose.model('zwaveNode', zwaveNodeSchema);
