"use strict";
module.exports = function(sequelize, DataTypes) {
    var PendingFriendRequest = sequelize.define("pending_friend_request", {
        request_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_request: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            },
        },
        user_requested: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            },
        },
    }, {
        tableName: "pending_friend_request",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return PendingFriendRequest;
};