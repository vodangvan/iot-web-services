var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/config/config.json')[env];
var rest = require("./REST.js");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var socketController = require('./controller/socketController');

function REST() {
    var self = this;
    self.connectMysql();
};

REST.prototype.connectMysql = function() {
    var self = this;
    var pool = mysql.createPool({
        connectionLimit: config.connectionLimit,
        host: config.host,
        user: config.username,
        password: config.password,
        database: config.database,
        debug: false,
        multipleStatements: true
    });
    pool.getConnection(function(err, connection) {
        if (err) {
            self.stop(err);
        } else {
            self.configureExpress(connection);
        }
    });
}

var allowCrossDomain = function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Accept-Language', 'en-US');
    next();
}

REST.prototype.configureExpress = function(connection) {
    var self = this;
    app.use(function(req, res, next) {
        res.io = io;
        next();
    });

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    var router = express.Router();
    app.use(allowCrossDomain);
    app.use('/api', router);
    var rest_router = new rest(router);
    self.startServer();
}

REST.prototype.startServer = function() {
    app.set('port', process.env.PORT || 3000);
    app.set('ip', process.env.IP || '127.0.0.1');

    server.listen(app.get('port'), app.get('ip'), function() {
            console.log('All right ! I am alive at Port: %s:%s!', app.get('ip'), app.get('port'));
        }),
        //io = io.listen(server);
        //io.set('match origin protocol', true);
        io.set('origins', '*:*');
    var esp8266_nsp = io.of(config.nameSpaceSocket);
    var middleware = require('socketio-wildcard')();
    esp8266_nsp.use(middleware);

    io.sockets.on('connection', function(socket) {
        socketController.RunSocket(socket);
    });

    esp8266_nsp.on('connection', function(socket) {
        console.log('esp8266 connected');
        socketController.RunSocketForStation(socket, io.sockets, esp8266_nsp);
    });

}

REST.prototype.stop = function(err) {
    console.log("ISSUE WITH MYSQL \n" + err);
    process.exit(1);
}

new REST();