var mysql = require('mysql');
var express = require('express');
var hat = require('hat');
var router = express.Router();

// DB configuration
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'todos'
});

// connect to DB
connection.connect(function (err) {
    if (err) {
        console.log('Can\'t connect to DB');
        process.exit(1);
    }
});

// middleware function to authenticate access token
router.use('/todos', function (req, res, next) {
    token = req.get('token');
    connection.query('SELECT id FROM users WHERE token = ? ', [token], function (err, rows) {
        if(rows.length > 0){
            req.user_id = rows[0].id;
            next();
        } else {
            res.status(401).send({success: false, message: 'Unauthorized user'});
        }
    });
});

router.post('/signup', function (req, res) {
    if(typeof req.body.fullName == 'undefined' || req.body.fullName.trim() == '' || typeof req.body.username == 'undefined' ||  req.body.username.trim() == '' || typeof req.body.password == 'undefined' ||  req.body.password.trim() == ''){
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var fullName = req.body.fullName;
        var username = req.body.username;
        var password = req.body.password;

        connection.query('INSERT INTO users SET ? ', {fullname: fullName, username: username, password: password}, function (err, result) {
            if (!err) {
                res.status(201);
                res.send({success: true, message: 'User has been created successfully'});
            }
        });
    }
});

router.post('/authenticate', function (req, res) {
    if(typeof req.body.username == 'undefined' ||  req.body.username.trim() == '' || typeof req.body.password == 'undefined' ||  req.body.password.trim() == ''){
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var username = req.body.username;
        var password = req.body.password;

        connection.query('SELECT id FROM users WHERE username = ? AND password = ? LIMIT 1', [username, password], function (err, rows) {
            if (!err) {
                if (rows.length > 0) {
                    token = hat();
                    connection.query('UPDATE users SET token = ? WHERE id = ? ', [token, rows[0].id], function (err, result) {
                        res.status(200);
                        res.send({success: true, message: 'User has been logged in successfully', data: {token: token}});
                    });
                } else {
                    res.status(401);
                    res.send({success: false, message: 'Unauthorized user'});
                }
            }
        });
    }
});

router.get('/todos', function (req, res){
    var user_id = req.user_id;
    
    connection.query("SELECT *, if(done = 0, 'pending', 'done') AS `status` FROM todos WHERE user_id = ? ", [user_id], function(err, rows){
        if(!err){
            todos = [];
            for(i = 0 ; i < rows.length ; i++){
                todos.push({id: rows[i].id, body: rows[i].body, status: rows[i].status, createdAt: rows[i].createdAt});
            }
            res.status(200).send({success: true, data: {todos: todos}});
        }
    });
});

router.post('/todos', function (req, res) {
    if(typeof req.body.body == 'undefined' || req.body.body.trim() == ''){
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var user_id = req.user_id;
        var body = req.body.body;
        var done = req.body.done == 1 ? 1 : 0;

        connection.query('INSERT INTO todos SET ? ', {body: body, done: done, user_id: user_id}, function (err, result) {
            if (!err) {
                console.log(result);
                res.status(201);
                res.send({success: true, message: 'Todo # ' + result.insertId + ' has been created successfully'});
            }
        });
    }
});

router.post('/todos/:todo_id/toggle_done', function (req, res){
    if(typeof req.params.todo_id == 'undefined' || isNaN(req.params.todo_id)){
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var user_id = req.user_id;
        var todo_id = req.params.todo_id;

        connection.query('UPDATE todos SET done = if(done = 0, 1, 0) WHERE id = ? AND user_id = ? ', [todo_id, user_id], function (err, result) {
            if(result.affectedRows > 0){
                res.status(200);
                res.send({success: true, message: 'Todo #' + todo_id + ' has been updated'});
            } else {
                res.status(200);
                res.send({success: false, message: 'Todo #' + todo_id + ' is not exists in your Todos'});
            }
        });
    }
});

router.delete('/todos/:todo_id', function (req, res) {
    if(typeof req.params.todo_id == 'undefined' || isNaN(req.params.todo_id)){
        res.status(200);
        res.send({success: false, message: 'Missing Parameters'});
    } else {
        var todo_id = req.params.todo_id;
        var user_id = req.user_id;
        connection.query('DELETE FROM todos WHERE id = ? AND user_id = ? ', [todo_id, user_id], function (err, result) {
            if(result.affectedRows > 0){
                res.status(200);
                res.send({success: true, message: 'Todo #' + todo_id + ' has been deleted'});
            } else {
                res.status(200);
                res.send({success: false, message: 'Todo #' + todo_id + ' is not exists in your Todos'});
            }
        });
    }
});

module.exports = router;
