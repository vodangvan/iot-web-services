var model = require('../models');
var HttpStatus = require('http-status-codes');
var moment = require('moment');
var Q = require('q');
module.exports = {
    GetByConversationId: function(conversationId, page = 0, pageSize, done) {
        var strQuery = "SELECT a.`user_id`, a.`user_fullName`, a.`user_userName`,b.`conversation_id`,b.`message_content`, b.`message_time` ";
        strQuery += "FROM `user` as a, `message` as b ";
        strQuery += "WHERE b.`conversation_id` = " + conversationId;
        strQuery += " and a.`user_id` = b.`user_id` ORDER BY b.`message_id` DESC";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            var dataList = {};
            dataList = data.slice(parseInt(page) * parseInt(pageSize), parseInt(page) * parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);
        })
    },

    GetByMessageId: function(messageId, done) {
        model.message.findOne({
            where: { message_id: messageId }
        }).then(function(data) {
            return done(data);
        })
    },

    //Xem lai conversation_id
    MapMessage: function(body, done) {
        var dataNew = {
            conversation_id: body.conversation_id,
            user_id: body.user_id,
            message_content: body.message_content,
            message_time: body.message_time
        }
        model.message.build(dataNew).validate().then(function(err) {
            if (err) {
                return done(HttpStatus.BAD_REQUEST, err);
            } else {
                return done(HttpStatus.OK, dataNew);
            }
        })
    },

    Add: function(dataNew, done) {
        dataNew.message_time = moment(new Date()).tz(config.timezoneDefault)._d;
        console.log(dataNew);
        model.message.create(dataNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            console.log(error);
            return done(HttpStatus.BAD_REQUEST, error);
        })
    },

    Update: function(dataNew, id, done) {
        model.message.update(dataNew, {
            where: { message_id: id }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(message, id, done) {
        model.message.destroy({ where: { message_id: id } }).then(function(data) {
            return done(HttpStatus.OK, obj);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }
}