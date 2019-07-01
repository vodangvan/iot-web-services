var model = require('../models'),
    service = require('../services/Infrastructure'),
    accountService = require('../services/AccountService'),
    notificationService = require('../services/NotificationService'),
    HttpStatus = require('http-status-codes'),
    express = require('express'),
    jwt = require('jwt-simple'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config.json')[env];


function ACCOUNT_CONTROLLER(routerAccount) {
    var self = this;
    self.handleRoutes(routerAccount);
}

ACCOUNT_CONTROLLER.prototype.handleRoutes = function(routerAccount) {
    var self = this;

    function expiresIn(numDays) {
        var dateObj = new Date();
        return dateObj.setDate(dateObj.getDate() + numDays);
    };
    //Đăng nhập
    routerAccount.post("/login", function(req, res) {
        var params = req.query;
        var userName = params.userName;
        var password = params.password;
        accountService.PasswordSignIn(userName, password).then(function(data) {
            var userFind = data.data;
            var expires = expiresIn(1);
            var payload = { id: config.payloadID };
            var token = jwt.encode({ payload: payload, exp: expires }, config.secretOrKey);
            var user = {
                user_id: userFind.user_id,
                user_userName: userFind.user_userName,
                user_fullName: userFind.user_fullName,
                user_birthday: userFind.user_birthday,
                user_onlineStatus: true,
                token: {
                    accessToken: token,
                    expires: expires,
                    token_type: config.token_type
                }
            };
            return service.CreateResponse(data.statusCode, res, user);
        }).catch(function(error) {
            return service.CreateResponse(error.statusCode, res, error.data);
        });
    });


}

module.exports = ACCOUNT_CONTROLLER;