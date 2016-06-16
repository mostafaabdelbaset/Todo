/* global module */

var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var userCtrl = require('../controllers/user.server.controller');

// middleware function to authenticate access token
router.use('/todos', function (req, res, next) {
    token = req.get('token');
    if (token) {

        jwt.verify(token, req.app.get('secret'), function (err, decoded) {
            if (err) {
                return res.status(401).json({success: false, message: 'Failed to authenticate token.'});
            } else {
                req.user_id = decoded._doc._id;
                next();
            }
        });

    } else {
        // if there is no token
        return res.status(403).json({success: false, message: 'No token provided.'});
    }
});

router.post('/signup', function (req, res) {
    userCtrl.signup(req, res);
});

router.post('/authenticate', function (req, res) {
    userCtrl.authenticate(req, res);
});

router.get('/todos', function (req, res) {
    userCtrl.getTodos(req, res);
});

router.post('/todos', function (req, res) {
    userCtrl.addTodo(req, res);
});

router.post('/todos/:todo_id/toggle_done', function (req, res) {
    userCtrl.toggleTodo(req, res);
});

router.delete('/todos/:todo_id', function (req, res) {
    userCtrl.removeTodo(req, res);
});

module.exports = router;
