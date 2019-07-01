var HttpStatus = require('http-status-codes');
var model = require('../models'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig'),
    Q = require('q'),
    config = require('../config/config')[env];

module.exports = {
    //Lay danh sach ban theo id nguoi dung
    //Tham so: 
    // + userId: user_id nguoi can lay danh sach ban
    // + done: du lieu tra ve sau khi truy van
    //Ket qua:
    // + done
    GetByUserId: function(userId, done) {
        var strQuery = "SELECT a.`user_id`, a.`user_fullName`, a.`user_userName`,b.`conversation_id` ";
        strQuery += "FROM `user` as a, `friend` as b ";
        strQuery += "WHERE b.`user_id` = " + userId;
        strQuery += " and a.`user_id` = b.`user_friendUserId`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },

    GetPendingByUserId: function(userId, done) {
        var strQuery = "SELECT a.`user_id`, a.`user_fullName`, a.`user_userName` ";
        strQuery += "FROM `user` as a, `pending_friend_request` as b ";
        strQuery += "WHERE b.`user_requested` = " + userId;
        strQuery += " and a.`user_id` = b.`user_request`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },

    //Xem lai conversation_id
    MapFriend: function(body, done) {
        model.friend.findOne({
            where: {
                $and: [
                    { user_id: body.user_id },
                    { user_friendUserId: body.user_friendUserId }
                ]
            }
        }).then(function(data) {
            if (data) {
                return done(HttpStatus.BAD_REQUEST, "Đã tồn tại bạn");
            } else {
                var newConversation = model.conversation.build();
                newConversation.save().then(function(newConversation) {
                    var dataNew = {
                        data1: {
                            user_id: body.user_id,
                            user_friendUserId: body.user_friendUserId,
                            conversation_id: newConversation.conversation_id
                        },
                        data2: {
                            user_id: body.user_friendUserId,
                            user_friendUserId: body.user_id,
                            conversation_id: newConversation.conversation_id
                        }
                    }
                    console.log(dataNew);
                    model.friend.build(dataNew.data1).validate().then(function(err1) {
                        if (err1) {
                            return done(HttpStatus.BAD_REQUEST, err1);
                        } else {
                            model.friend.build(dataNew.data2).validate().then(function(err2) {
                                if (err2) {
                                    return done(HttpStatus.BAD_REQUEST, err2);
                                } else {
                                    return done(HttpStatus.OK, dataNew);
                                }
                            })
                        }
                    })
                })
            }
        })
    },

    Add: function(dataNew, done) {
        model.friend.create(dataNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        })
    },

    Update: function(dataNew, id, done) {
        model.friend.update(dataNew, {
            where: { friend_id: id }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(userId, userFriendId, done) {
        model.friend.destroy({
            where: {
                $or: [
                    $and[{ user_id: userId }, { user_friendUserId: userFriendId }],
                    $and[{ user_id: userFriendId }, { user_friendUserId: userId }]
                ]
            }
        }).then(function(data) {
            return done(HttpStatus.OK, data);
        }).catch(function(err) {
            return done(HttpStatus.BAD_REQUEST, error);
        })
    }
}