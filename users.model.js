const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    count : {
        type : Number,
        required : true
    }
});

module.exports = mongoose.model('Users', usersSchema);