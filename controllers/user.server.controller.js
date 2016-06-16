/* global exports */

var User = require('../models/user.server.model');
var jwt = require('jsonwebtoken');

exports.signup = function (req, res) {
    if (typeof req.body.fullName == 'undefined' || req.body.fullName.trim() == '' || typeof req.body.username == 'undefined' || req.body.username.trim() == '' || typeof req.body.password == 'undefined' || req.body.password.trim() == '') {
        res.status(200);
        res.json({success: false, message: 'Missing Parameters'});
    } else {
        var fullName = req.body.fullName;
        var username = req.body.username;
        var password = req.body.password;

        User.findOne({
            username: req.body.username
        }, function (err, user) {

            if (err)
                throw err;

            if (user) {
                res.json({success: false, message: 'Username is already exists'});
            } else {

                var newUser = new User({
                    fullName: fullName,
                    username: username,
                    password: password
                });

                newUser.save(function (err) {
                    if (err) {
                        res.json({success: false, message: 'User has not been created'});
                    } else {
                        res.status(201);
                        res.json({success: true, message: 'User has been created successfully'});
                    }
                });
            }
        });
    }
};

exports.authenticate = function (req, res) {
    if (typeof req.body.username == 'undefined' || req.body.username.trim() == '' || typeof req.body.password == 'undefined' || req.body.password.trim() == '') {
        res.status(200);
        res.json({success: false, message: 'Missing Parameters'});
    } else {
        var username = req.body.username;
        var password = req.body.password;

        User.findOne({
            username: username
        }, function (err, user) {

            if (err)
                throw err;

            if (!user) {
                res.status(401);
                res.json({success: false, message: 'Authentication failed. User not found.'});
            } else if (user) {
                // check if password matches
                if (user.password != password) {
                    res.status(401);
                    res.json({success: false, message: 'Authentication failed. Wrong password.'});
                } else {
                    // create a token
                    var token = jwt.sign(user, req.app.get('secret'));
                    res.status(200);
                    res.json({success: true, message: 'User has been logged in successfully', data: {token: token}});
                }
            }
        });
    }
};

exports.getTodos = function (req, res) {
    var user_id = req.user_id;
    todos = [];
    User.findById(user_id).exec(function (err, user) {
        var userTodos = user.todos;
        for (i = 0; i < userTodos.length; i++) {
            todos.push({id: userTodos[i]._id, body: userTodos[i].body, status: userTodos[i].done ? 'Done' : 'Pending', createdAt: userTodos[i].createdAt});
        }
        res.status(200).send({success: true, data: {todos: todos}});
    });
};

exports.addTodo = function (req, res) {
    if (typeof req.body.body == 'undefined' || req.body.body.trim() == '') {
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var user_id = req.user_id;
        var body = req.body.body;
        var done = req.body.done == 1 ? true : false;

        User.findById(user_id).exec(function (err, user) {
            user.todos.push({body: body, done: done});
            user.save(function (err) {
                if (err) {
                    res.json({success: false, message: 'Todo has not been created'});
                } else {
                    res.status(201);
                    res.send({success: true, message: 'Todo has been created successfully'});
                }
            });
        });
    }
};

exports.toggleTodo = function (req, res) {
    if (typeof req.params.todo_id == 'undefined') {
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var user_id = req.user_id;
        var todo_id = req.params.todo_id;

        User.findById(user_id).exec(function (err, user) {
            if(user.todos.id(todo_id)){
                user.todos.id(todo_id).done = !user.todos.id(todo_id).done;
                user.save(function(err){
                    if (err) {
                        res.status(200);
                        res.send({success: false, message: 'Todo #' + todo_id + ' has not been updated'});
                    } else {
                        res.status(200);
                        res.send({success: true, message: 'Todo #' + todo_id + ' has been updated'});
                    }
                });
            } else {
                res.status(200);
                res.send({success: false, message: 'Todo #' + todo_id + ' is not exists in your Todos'});
            }
        });
    }
};

exports.removeTodo = function (req, res) {
    if (typeof req.params.todo_id == 'undefined') {
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var todo_id = req.params.todo_id;
        var user_id = req.user_id;
        
        User.findById(user_id).exec(function (err, user) {
            if(user.todos.id(todo_id)){
                user.todos.id(todo_id).remove();
                user.save(function(err){
                    if (err) {
                        res.status(200);
                        res.send({success: false, message: 'Todo #' + todo_id + ' is not exists in your Todos'});
                    } else {
                        res.status(200);
                        res.send({success: true, message: 'Todo #' + todo_id + ' has been deleted'});
                    }
                });
            } else {
                res.send({success: false, message: 'Todo #' + todo_id + ' is not exists in your Todos'});
            }
        });
    }
};