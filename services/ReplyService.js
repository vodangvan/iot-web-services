var model = require('../models');
var HttpStatus = require('http-status-codes');
var threadCreatorId;
module.exports = {

    GetByThread: function(threadId, page = 0, pageSize, done) {
        var strQuery = "SELECT a.`reply_id`, a.`user_id`, a.`thread_id`, a.`reply_index`, a.`reply_time`, a.`reply_votes`, a.`reply_lastEdit`, a.`reply_content`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `reply` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "AND a.`thread_id` = " + threadId;
        strQuery += " ORDER BY a.`reply_index` ASC";
        model.sequelize.query(strQuery, {
            type: model.sequelize.QueryTypes.SELECT
        }).then(function(data) {
            var dataList = {};
            dataList = data.slice(parseInt(page) * parseInt(pageSize), parseInt(page) * parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);
        });
    },

    GetById: function(id, done) {
        var strQuery = "SELECT a.`thread_id`, a.`user_id`, a.`thread_title`, a.`thread_time`, a.`thread_views`, a.`thread_votes`, a.`thread_replies`, a.`thread_content`, a.`thread_lastEdit`, a.`thread_tag`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `thread` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "AND a.`thread_id` = " + id;
        model.sequelize.query(strQuery, {
            type: model.sequelize.QueryTypes.SELECT
        }).then(function(data) {
            return done(data);
        });
    },

    GetByUserId: function(id, done) {
        var strQuery = "SELECT a.`reply_id`, a.`user_id`, a.`thread_id`, a.`reply_index`, a.`reply_time`, a.`reply_votes`, a.`reply_lastEdit`, a.`reply_content`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `reply` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "AND a.`user_id` = " + id;
        strQuery += " ORDER BY a.`reply_id` ASC";
        model.sequelize.query(strQuery, {
            type: model.sequelize.QueryTypes.SELECT
        }).then(function(data) {
            return done(data);
        });
    },

    MapReply: function(body, done) {
        var dataNew = {
            user_id: body.user_id,
            thread_id: body.thread_id,
            reply_index: body.reply_index,
            reply_time: body.reply_time,
            reply_content: body.reply_content,
            reply_lastEdit: body.reply_lastEdit,
            reply_votes: body.reply_votes,
        };
        model.reply.build(dataNew).validate().then(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
            else {
                return done(HttpStatus.OK, dataNew);
            }
        });
    },

    Add: function(dataNew, done) {
        //Update replies cua thread
        model.thread.findOne({ where: { thread_id: dataNew.thread_id } }).then(function(data) {
            dataNew.reply_index = data.thread_replies + 1;
            threadCreatorId = data.user_id;
            model.thread.update({ thread_replies: data.thread_replies + 1 }, { where: { thread_id: data.thread_id } });
            model.reply.create(dataNew).then(function(data) {
                data.creatorId = threadCreatorId;
                return done(HttpStatus.CREATED, data);
            }).catch(function(error) {
                if (error)
                    return done(HttpStatus.BAD_REQUEST, error);
            });
        })
    },

    UpVotes: function(id, reply) {
        model.reply.update({ reply_votes: reply.reply_votes + 1 }, { where: { reply_id: id } });
    },

    DownVotes: function(id, reply) {
        model.reply.update({ reply_votes: reply.reply_votes - 1 }, { where: { reply_id: id } });
    },

    Update: function(dataNew, id, done) {
        dataNew.reply_lastEdit = Date.now();
        model.reply.update(dataNew, {
            where: { reply_id: id }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done) {
        model.reply.destroy({ where: { reply_id: id } }).then(function(data) {
            return done(HttpStatus.OK, obj);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }

}