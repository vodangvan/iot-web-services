"use strict";
module.exports = function(sequelize, DataTypes) {
    var ChatGroupMember = sequelize.define("chat_group_member", {
        chatgroupmember_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            },
        },
        chatgroup_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'chat_group',
                key: 'chatgroup_id'
            },
            validate: {
                isInt: true
            }
        },
        chatgroupmember_isManager: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        tableName: "chat_group_member",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return ChatGroupMember;
};