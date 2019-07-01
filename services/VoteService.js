var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');

var threadCreatorId;
var voteCount = 0;

module.exports = {
    GetByThreadId: function(threadId, done) {
        var strQuery = "SELECT a.`vote_id`, a.`user_id`, a.`vote_time`,b.`user_userName`, b.'user_fullName' ";
        strQuery += "FROM `vote` as a, `user` as b ";
        strQuery += "WHERE a.`thread_id` = " + threadId;
        strQuery += " AND a.`reply_id` = 0"
        strQuery += " and a.`user_id` = b.`user_id`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },
    GetByReplyId: function(replyId, done) {
        var strQuery = "SELECT a.`vote_id`, a.`user_id`, a.`vote_time`,b.`user_userName`, b.'user_fullName' ";
        strQuery += "FROM `vote` as a, `user` as b ";
        strQuery += "WHERE a.`reply_id` = " + replyId;
        strQuery += " and a.`user_id` = b.`user_id`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },

    GetByThreadId: function(userId, threadId, done) {
        model.vote.findOne({
            where: {
                $and: [
                    { thread_id: threadId },
                    { user_id: userId },
                    { reply_id: 0 }
                ]
            }
        }).then(function(data) {
            return done(data);
        })
    },

    // GetByVoteId: function(voteId, done) {
    //     model.vote.findOne({
    //         where: {
    //             $and: [
    //                 { thread_id: dataNew.thread_id },
    //                 { user_id: dataNew.user_id },
    //                 { reply_id: dataNew.reply_id }
    //             ]
    //         }
    //     }).then(function(data) {
    //         return done(data);
    //     })
    // },

    MapVote: function(body, done) {
        var dataNew = {
            user_id: body.user_id,
            thread_id: body.thread_id,
            reply_id: body.reply_id,
            vote_time: body.vote_time
        }
        model.vote.build(dataNew).validate().then(function(err) {
            if (err) {
                return done(HttpStatus.BAD_REQUEST, err);
            } else {
                return done(HttpStatus.OK, dataNew);
            }
        })
    },

    AddThreadVote: function(dataNew, done) {
        dataNew.reply_id = 0;
        model.vote.findOne({
            where: {
                $and: [
                    { thread_id: dataNew.thread_id },
                    { user_id: dataNew.user_id },
                    { reply_id: dataNew.reply_id }
                ]
            }
        }).then(function(data) {
            if (data) {
                return done(HttpStatus.BAD_REQUEST, "Đã tồn tại vote");
            } else {
                model.thread.findOne({ where: { thread_id: dataNew.thread_id } }).then(function(data) {
                    voteCount = data.thread_votes + 1;
                    threadCreatorId = data.user_id;
                    model.thread.update({ thread_votes: voteCount }, { where: { thread_id: data.thread_id } });
                    model.vote.create(dataNew).then(function(data) {
                        return done(HttpStatus.CREATED, { "voteCount": voteCount, "threadCreatorId": threadCreatorId, "thread_id": data.thread_id });
                    }).catch(function(error) {
                        return done(HttpStatus.BAD_REQUEST, error);
                    })
                })
            }
        })

    },

    // RemoveVote: function(dataNew, done) {
    //     model.vote.findOne({
    //         where: {
    //             $and: [
    //                 { thread_id: dataNew.thread_id },
    //                 { user_id: dataNew.user_id },
    //                 { reply_id: dataNew.reply_id || 0 }
    //             ]
    //         }
    //     }).then(function(data) {
    //         if (data) {
    //             model.thread.findOne({ where: { thread_id: dataNew.thread_id } }).then(function(data) {
    //                 voteCount = data.thread_votes - 1;
    //                 model.thread.update({ thread_votes: voteCount }, { where: { thread_id: data.thread_id } });
    //             })
    //             model.vote.destroy(dataNew).then(function(data) {
    //                 return done(HttpStatus.OK, obj);
    //             }).catch(function(error) {
    //                 return done(HttpStatus.BAD_REQUEST, error);
    //             });

    //         } else {
    //             return done(HttpStatus.BAD_REQUEST, "Vote không tồn tại");
    //         }
    //     })
    // },

    // AddReplyVote: function(dataNew, done) {
    //     model.vote.findOne({
    //         where: {
    //             $and: [
    //                 { thread_id: dataNew.thread_id },
    //                 { user_id: dataNew.user_id },
    //                 { reply_id: dataNew.reply_id }
    //             ]
    //         }
    //     }).then(function(data) {
    //         if (data) {
    //             return done(HttpStatus.BAD_REQUEST, "Đã tồn tại vote");
    //         } else {
    //             model.reply.findOne({ where: { reply_id: dataNew.reply_id } }).then(function(data) {
    //                 voteCount = data.thread_votes + 1;
    //                 model.reply.update({ reply_votes: data.reply_votes + 1 }, { where: { reply_id: data.reply_id } });
    //             })
    //             model.vote.create(dataNew).then(function(data) {
    //                 return done(HttpStatus.CREATED, voteCount);
    //             }).catch(function(error) {
    //                 return done(HttpStatus.BAD_REQUEST, voteCount);
    //             })
    //         }
    //     })
    // },

    Update: function(dataNew, id, done) {
        model.vote.update(dataNew, {
            where: { vote_id: id }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(vote, id, done) {
        model.thread.findOne({ where: { thread_id: vote.thread_id } }).then(function(data) {
            voteCount = data.thread_votes - 1;
            model.thread.update({ thread_votes: voteCount }, { where: { thread_id: data.thread_id } });
            model.vote.destroy({ where: { vote_id: id } }).then(function(data) {
                return done(HttpStatus.OK, { "voteCount": voteCount, "threadCreatorId": threadCreatorId });
            }).catch(function(error) {
                return done(HttpStatus.BAD_REQUEST, error);
            });
        });
    }
}