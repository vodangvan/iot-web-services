var model = require('../models');
var HttpStatus = require('http-status-codes');

var UpdateViews = function(id, thread) {
    model.thread.update({ thread_views: thread.thread_views + 1 }, { where: { thread_id: id } });
};

module.exports = {
    GetAll: function(done) {
        var strQuery = "SELECT a.`thread_id`, a.`user_id`, a.`thread_title`, a.`thread_time`, a.`thread_views`, a.`thread_votes`, a.`thread_replies`, a.`thread_content`, a.`thread_lastEdit`, a.`thread_tag`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `thread` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "ORDER BY a.`thread_id` DESC"
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },

    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done) {
        var strQuery = "SELECT a.`thread_id`, a.`user_id`, a.`thread_title`, a.`thread_time`, a.`thread_views`, a.`thread_votes`, a.`thread_replies`, a.`thread_content`, a.`thread_lastEdit`, a.`thread_tag`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `thread` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "AND a.`thread_title` LIKE '%" + keyword + "%'"
        strQuery += "ORDER BY a.`thread_id` DESC"
        model.sequelize.query(strQuery, {
            type: model.sequelize.QueryTypes.SELECT
                // model.thread.findAll({
                //     where: {
                //         thread_title: { $like: '%' + keyword + '%' }
                //     },
                //     order: 'thread_id DESC'
        }).then(function(data) {
            console.log(data);
            var dataList = {};
            dataList = data.slice(parseInt(page) * parseInt(pageSize), parseInt(page) * parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);
        });
    },

    GetAllByTag: function(tag = '', page = 0, pageSize, done) {
        if (tag[0] != '#') {
            temptag = tag;
            tag = "#" + temptag;
        }
        var strQuery = "SELECT a.`thread_id`, a.`user_id`, a.`thread_title`, a.`thread_time`, a.`thread_views`, a.`thread_votes`, a.`thread_replies`, a.`thread_content`, a.`thread_lastEdit`, a.`thread_tag`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `thread` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "AND a.`thread_tag` LIKE '%" + tag + " %'"
        strQuery += "ORDER BY a.`thread_id` DESC"
        model.sequelize.query(strQuery, {
            type: model.sequelize.QueryTypes.SELECT
        }).then(function(data) {
            console.log(data);
            var dataList = {};
            dataList = data.slice(parseInt(page) * parseInt(pageSize), parseInt(page) * parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);
        });
    },



    UpVotes: function(id, thread) {
        model.thread.update({ thread_votes: thread.thread_votes + 1 }, { where: { thread_id: id } });
    },

    UpReplies: function(id, thread) {
        model.thread.update({ thread_votes: thread.thread_replies + 1 }, { where: { thread_id: id } });
    },

    DownVotes: function(id, thread) {
        model.thread.update({ thread_votes: thread.thread_votes - 1 }, { where: { thread_id: id } });
    },

    GetById: function(id, done) {
        var strQuery = "SELECT a.`thread_id`, a.`user_id`, a.`thread_title`, a.`thread_time`, a.`thread_views`, a.`thread_votes`, a.`thread_replies`, a.`thread_content`, a.`thread_lastEdit`, a.`thread_tag`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `thread` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "AND a.`thread_id` = " + id;
        model.sequelize.query(strQuery, {
            type: model.sequelize.QueryTypes.SELECT
        }).then(function(data) {
            UpdateViews(data[0].thread_id, data[0]);
            return done(data);
        });
    },

    GetByUserId: function(id, done) {
        var strQuery = "SELECT a.`thread_id`, a.`user_id`, a.`thread_title`, a.`thread_time`, a.`thread_views`, a.`thread_votes`, a.`thread_replies`, a.`thread_content`, a.`thread_lastEdit`, a.`thread_tag`, b.`user_fullName`, b.`user_userName` ";
        strQuery += "FROM `thread` as a, `user` as b ";
        strQuery += "WHERE a.`user_id` = b.`user_id` ";
        strQuery += "AND a.`user_id` = " + id;
        strQuery += " ORDER BY a.`user_id` ASC";
        model.sequelize.query(strQuery, {
            type: model.sequelize.QueryTypes.SELECT
        }).then(function(data) {
            return done(data);
        });
    },

    MapThread: function(body, done) {
        var dataNew = {
            user_id: body.user_id,
            thread_title: body.thread_title,
            thread_time: body.thread_time,
            thread_views: body.thread_views,
            thread_replies: body.thread_replies,
            thread_votes: body.thread_votes,
            thread_lastEdit: body.thread_lastEdit,
            thread_content: body.thread_content,
            thread_tag: body.thread_tag
        };
        model.thread.build(dataNew).validate().then(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
            else {
                return done(HttpStatus.OK, dataNew);
            }
        });
    },

    Add: function(dataNew, done) {
        model.thread.create(dataNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done) {
        model.thread.update(dataNew, {
            where: { thread_id: id }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, id, done) {
        model.reply.destroy({ where: { thread_id: id } }).then(function() {
            model.vote.destroy({ where: { thread_id: id } }).then(function() {
                model.thread.destroy({ where: { thread_id: id } }).then(function(data) {
                    return done(HttpStatus.OK, obj);
                }).catch(function(error) {
                    return done(HttpStatus.BAD_REQUEST, error);
                });
            })
        })
    }

}