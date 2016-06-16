/* global module */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var subTodos = new Schema({
    body: String,
    done: Boolean,
    created_at: { type: Date, default: Date.now }
});

var userSchema = new Schema({
    fullName: String,
    username: String,
    password: String,
    todos: [ subTodos ]
});
    
module.exports = mongoose.model('User', userSchema);