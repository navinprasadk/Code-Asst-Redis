#!/usr/bin/env node

// creating an instance of zukti app
var app = require('../webserver/webapp.service')();

// listening to port 8080
let server = app.listen(8080, '0.0.0.0', function(err, result) {
    if (err) {
        console.error("error ", err);
    }
    console.log("server started at 8080");
});

// socket.io demo
let io = require('socket.io')(server);
io.on('connection', function(socket) {

    socket.emit('server event', {
        foo: 'bar'
    });
    socket.on('newQuery', function(data) {
      socket.broadcast.emit('incrementQueryCount', data);
    });
    socket.on('userLoginStatus', function(data) {
      socket.broadcast.emit('userLoggedIncount', data);
    });
    socket.on('client event', function(data) {
        socket.broadcast.emit('update label', data);
    });
});
