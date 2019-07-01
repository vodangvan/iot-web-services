var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {

    GetById: function(userID, functionGroupID, done) {
        model.user_function_group.findOne({
            where: {
                user_id: userID,
                function_group_id: functionGroupID
            }
        }).then(function(data) {
            return done(data);
        });
    },
    GetByUserId: function(userId, done) {
        var strQuery = "SELECT a.`user_id`, a.`function_group_id`, a.`is_active`,b.`role`,b.`function_group_tag`,b.`href`,b.`description` ";
        strQuery += "FROM `user_function_group` as a, `function_group` as b ";
        strQuery += "WHERE a.`user_id` = " + userId;
        strQuery += " and a.`function_group_id` = b.`function_group_id`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },
    //
    MapUserFunctionGroup: function(body, done) {

        var dataNew = {
            user_id: body.user_id,
            function_group_id: body.function_group_id,
            is_active: body.is_active
        };
        model.user_function_group.build(dataNew).validate().then(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
            else {
                return done(HttpStatus.OK, dataNew);
            }
        });
    },
    MultipleAdd: function(value, done) {
        var sql = "INSERT INTO `user_function_group` (`user_id`,`function_group_id`,`is_active`) VALUES " + value;
        model.sequelize.query(sql, { type: model.sequelize.QueryTypes.INSERT }).then(function(data) {
            return done(HttpStatus.OK, data);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Add: function(dataNew, done) {
        model.user_function_group.create(dataNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    //
    Update: function(dataNew, userid, functiongroupid, done) {
        dataNew.user_id = userid;
        dataNew.function_group_id = functiongroupid;
        model.user_function_group.update(dataNew, {
            where: {
                user_id: userid,
                function_group_id: functiongroupid
            }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    DeleteByUserID: function(userId, done) {
        var strQuery = "DELETE FROM `user_function_group` WHERE `user_id`=" + userId;
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.DELETE }).then(function(data) {
            return done(HttpStatus.OK, data);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, userId, done) {
        model.user_function.destroy({
            where: {
                user_id: userId
            }
        }).then(function(data) {
            return done(HttpStatus.OK, obj);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }

}