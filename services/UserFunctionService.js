var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {
    GetById: function(userID, functionID, done) {
        model.user_function.findOne({
            where: {
                user_id: userID,
                function_id: functionID
            }
        }).then(function(data) {
            return done(data);
        });
    },
    GetByUserId: function(userId, done) {
        var strQuery = "SELECT a.`user_id`, a.`function_id`, a.`isactive`,b.`function_name`,b.`function_href`,b.`function_tag`,b.`description` ";
        strQuery += "FROM `user_function` as a, `function` as b ";
        strQuery += "WHERE a.`user_id` = " + userId;
        strQuery += " and a.`function_id` = b.`function_id`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },
    GetByTag: function(userID, tag, done) {
        var strQuery = "SELECT a.`user_id`, a.`function_id`, a.`isactive`,b.`function_name`,b.`function_href`,b.`function_tag`,b.`description` ";
        strQuery += " FROM `user_function` as a, `function` as b ";
        strQuery += " WHERE a.`user_id` = " + userID;
        strQuery += " and b.`function_tag` = '" + tag + "'";
        strQuery += " and a.`function_id` = b.`function_id`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        });
    },
    Setactive: function(userID, funtionID, state, done) {
        var strQuery = "UPDATE"
    },
    //Here
    MapUserFunction: function(body, done) {

        var dataNew = {
            user_id: body.user_id,
            function_id: body.function_id,
            isactive: body.isactive
        };
        model.user_function.build(dataNew).validate().then(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
            else {
                return done(HttpStatus.OK, dataNew);
            }
        });
    },
    MultipleAdd: function(value, done) {
        var sql = "INSERT INTO `user_function` (`user_id`,`function_id`,`isactive`) VALUES " + value;
        model.sequelize.query(sql, { type: model.sequelize.QueryTypes.INSERT }).then(function(data) {
            return done(HttpStatus.OK, data);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Add: function(dataNew, done) {
        model.user_function.create(dataNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    // My code here
    Update: function(dataNew, userid, functionid, done) {
        dataNew.user_id = userid;
        dataNew.function_id = functionid;
        model.user_function.update(dataNew, {
            where: {
                user_id: userid,
                function_id: functionid
            }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    DeleteByUserID: function(userId, done) {
        var strQuery = "DELETE FROM `user_function` WHERE `user_id`=" + userId;
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