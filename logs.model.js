const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
    userID : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    duration : {
        type : Number,
        required : true
    },    
    date : {
        type : String
    }
});

module.exports = mongoose.model('Logs', logsSchema);