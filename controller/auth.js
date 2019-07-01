var express = require('express'),
    jwt = require('jwt-simple'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    model = require('../models'),
    bcrypt = require('bcrypt-nodejs'),
    config = require('../config/config.json')[env];


function AUTH_CONTROLLER(routerAuth) {
    var self = this;
    self.handleRoutes(routerAuth);
}

AUTH_CONTROLLER.prototype.handleRoutes = function(routerAuth) {
    var self = this;

    function expiresIn(numDays) {
        var dateObj = new Date();
        return dateObj.setDate(dateObj.getDate() + numDays);
    };
    routerAuth.post('/token', function(req, res, next) {
        var username = req.body.username || null,
            password = req.body.password || null,
            grant_type = req.body.grant_type;
        console.log(username + " " + password + " " + grant_type);
        //grant_type = grant_type.toLowerCase();
        if (!grant_type || grant_type.toLowerCase() != "password") {
            console.log(" aa" + grant_type);
            res.status(400);
            res.json({
                "status": 400,
                "message": messageConfig.authUnSupport
            });
            return;
        } else {
            model.user.findOne({ include: { model: model.role, as: 'Role' }, where: { user_userName: username } }).then(function(data) {
                var user = data;
                if (!user) {
                    res.status(401);
                    res.json({
                        "status": 401,
                        "message": messageConfig.accountNotExist
                    });
                    return;
                } else if (user.user_lockStatus == true) {
                    res.status(401);
                    res.json({
                        "status": 401,
                        "message": messageConfig.accountIsLock
                    });
                    return;
                } else {
                    bcrypt.compare(password, user.user_password, function(err, response) {
                        if (err) { return callback(err); }
                        if (!response) {
                            res.status(401);
                            res.json({
                                "status": 401,
                                "message": messageConfig.accountPassIncorrect
                            });
                            return;
                        }
                        var expires = expiresIn(7);
                        var payload = { id: config.payloadID };
                        var token = jwt.encode({ payload: payload, exp: expires }, config.secretOrKey);
                        res.json({ accessToken: token, token_type: config.token_type, expires: expires, user_id: user.user_id, username: username, fullName: user.user_fullName, role: user.Role.role_name });
                    });
                }
            });
        }
    });
}

module.exports = AUTH_CONTROLLER;