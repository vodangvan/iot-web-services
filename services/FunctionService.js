var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {


    GetById: function(funcId, done) {
        model.function.findOne({
            where: {
                function_id: funcId
            }
        }).then(function(data) {
            return done(data);
        });
    },
    GetIdByRole: function(role, done) {
        model.function.findAll({
            where: {
                function_name: role
            },
            attributes: ['function_id', 'function_name']
        }).then(function(data) {
            return done(data);
        });
    },
    Add: function(dataNew, done) {
        model.function.create(dataNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, funcId, done) {
        model.function.update(dataNew, {
            where: { function_id: funcId }
        }).then(function(error) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, funcId, done) {
        model.function.destroy({
            where: {
                function_id: funcId
            }
        }).then(function(data) {
            return done(HttpStatus.OK, obj);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }

}