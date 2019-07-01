var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {
    GetByUserId: function(userId, done) {
        var strQuery = "SELECT a.`chatgroup_id`, a.`chatgroup_name`, a.`conversation_id`,b.`chatgroupmember_isManager` ";
        strQuery += "FROM `chat_group` as a, `chat_group_member` as b ";
        strQuery += "WHERE b.`user_id` = " + userId;
        strQuery += " and a.`chatgroup_id` = b.`chatgroup_id`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },

    GetMemberList: function(chatGroupId, done) {
        var strQuery = "SELECT a.`user_id`, a.`chatgroupmember_isManager`, a.`chatgroupmember_id`, b.`user_fullName`, b.`user_username`, b.`user_onlineStatus` ";
        strQuery += "FROM `chat_group_member` as a, `user` as b ";
        strQuery += "WHERE a.`chatgroup_id` = " + chatGroupId;
        strQuery += " and a.`user_id` = b.`user_id`";
        model.sequelize.query(strQuery, { type: model.sequelize.QueryTypes.SELECT }).then(function(data) {
            return done(data);
        })
    },

    MapChatGroup: function(body, done) {
        // var newConversation = new model.conversation();
        // model.conversation.create(newConversation);
        // var dataNew = {
        //     conversation_id: newConversation.conversation_id,
        //     chatgroup_name: body.chatgroup_name
        // }
        // model.chat_group.build(dataNew).validate().then(function(error) {
        //     if (error)
        //         return done(HttpStatus.BAD_REQUEST, error);
        //     else {
        //         return done(HttpStatus.OK, dataNew);
        //     }
        // })

        var newConversation = model.conversation.build();
        newConversation.save().then(function(newConversation) {
            var dataNew = {
                chatgroup_name: body.chatgroup_name,
                conversation_id: newConversation.conversation_id
            }
            model.chat_group.build(dataNew).validate().then(function(err1) {
                if (err1) {
                    return done(HttpStatus.BAD_REQUEST, err1);
                } else {
                    return done(HttpStatus.OK, dataNew);
                }
            })
        })
    },

    // MapChatGroupMember: function(body, done) {
    //     var dataNew = {
    //         user_id: body.user_id,
    //         chatgroup_id: body.chatgroup_id,
    //         //chatgroupmember_isManager: body.chatgroupmember_isManager
    //     }
    //     model.chat_group_member.build(dataNew).validate().then(function(error) {
    //         if (error)
    //             return done(HttpStatus.BAD_REQUEST, error);
    //         else {
    //             return done(HttpStatus.OK, dataNew);
    //         }
    //     })
    // },

    // //DeleteChatGroupMember: function()
    Add: function(data, userId, done) {
        model.chat_group.create(data).then(function(data) {
            var newChatGroupMember = {
                chatgroup_id: data.chatgroup_id,
                user_id: userId,
                chatgroupmember_isManager: true
            }
            model.chat_group_member.build(newChatGroupMember).validate().then(function(newMember) {
                model.chat_group_member.create(newChatGroupMember);
            })
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            if (error)
                console.log(error);
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    AddMember: function(chatgroupId, userId) { //AddMember: function(chatgroupId, userId, done) {
        model.chat_group_member.findOne({
            where: {
                $and: [
                    { user_id: userId },
                    { chatgroup_id: chatgroupId }
                ]
            }
        }).then(function(searchResult) {
            if (searchResult) {
                return done(HttpStatus.BAD_REQUEST, "Đã tồn tại thành viên");
            } else {
                var newChatGroupMember = {
                    chatgroup_id: chatgroupId,
                    user_id: userId,
                    chatgroupmember_isManager: false
                }
                model.chat_group_member.build(newChatGroupMember).validate().then(function(newMember) {

                    model.chat_group_member.create(newChatGroupMember).then(function(data) {
                        return data; //return done(HttpStatus.CREATED, data);
                    }).catch(function(error) {
                        if (error)
                            return error; //return done(HttpStatus.BAD_REQUEST, error);
                    })
                })
            }
        })


    },

    // Update: function(dataNew, id, done) {
    //     dataNew.chatgroup_id = id;
    //     model.region.update(dataNew, {
    //         where: { region_id: id }
    //     }).then(function(data) {
    //         return done(HttpStatus.OK, dataNew);
    //     }).catch(function(error) {
    //         return done(HttpStatus.BAD_REQUEST, error);
    //     });
    // },

    // Delete: function(obj, id, done) {
    //     model.region.destroy({ where: { chatgroup_id: id } }).then(function(data) {
    //         return done(HttpStatus.OK, obj);
    //     }).catch(function(error) {
    //         return done(HttpStatus.BAD_REQUEST, error);
    //     });
    // }
}