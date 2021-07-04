const mongoose = require('mongoose');

// to create a model
var clientSchema = new mongoose.Schema({
    Order_id: String,
    Item_type: String,
    Order_date: String,
    Ship_date: String,
    Cost: String
}, { timestamps: true });

var clients = mongoose.model("clients", clientSchema);

module.exports = { clients };