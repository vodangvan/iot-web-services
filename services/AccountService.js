var express = require('express'),
    jwt     = require('jwt-simple'),
    env     = process.env.NODE_ENV || 'development',
    model = require('../models'),
    bcrypt = require('bcrypt-nodejs'),
    HttpStatus = require('http-status-codes'),
    messageConfig = require('../config/messageConfig'),
    Q = require("q");
module.exports = {
    PasswordSignIn: function(username, password){
        var deferred = Q.defer();
        model.user.findOne({include:{all: true}, where: {user_userName: username}}).then(function(data){
            var user = data;
            if (!user) {
                var obj = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: messageConfig.accountNotExist
                };
                deferred.reject(obj);
            }
            else{
                bcrypt.compare(password, data.user_password, function(err, response){
                    if (err) { 
                        var obj = {
                            statusCode: HttpStatus.BAD_REQUEST,
                            data: err
                        };
                        deferred.reject(obj);
                     }else if(!response) {
                        var obj = {
                            statusCode: HttpStatus.BAD_REQUEST,
                            data: messageConfig.accountPassIncorrect
                        };
                        deferred.reject(obj);
                    }else{
                        var obj = {
                            statusCode: HttpStatus.OK,
                            data: user
                        };
                        deferred.resolve(obj);
                    };
                });
            };            
        });
        return deferred.promise;
    }
}