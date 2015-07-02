module.exports = function(conf){
    var app = require('express').createServer()
      , io = require('socket.io').listen(app);
    app.listen(conf.socketport);

    return io;

};