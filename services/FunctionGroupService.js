var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {


    GetById: function(funcgrId, done) {
        model.function_group.findOne({
            where: {
                function_group_id: funcgrId
            }
        }).then(function(data) {
            return done(data);
        });
    },
    GetIdByRole: function(role, done) {
        model.function_group.findAll({
            where: {
                role: role
            },
            attributes: ['function_group_id', 'role']
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
            where: { function_group_id: funcId }
        }).then(function(error) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, funcId, done) {
        model.function.destroy({
            where: {
                function_group_id: funcId
            }
        }).then(function(data) {
            return done(HttpStatus.OK, obj);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }

}