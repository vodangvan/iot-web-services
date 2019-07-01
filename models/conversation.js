"use strict"
module.exports = function(sequelize, DataTypes) {
    var Conversation = sequelize.define("conversation", {
        conversation_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conversation_lastMessageContent: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValues: null
        },
        conversation_lastMessageTime: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValues: null
        },
        conversation_lastMessageState: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValues: null
        },
        conversation_lastMessageSender: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValues: null,
            references: {
                model: 'user',
                key: 'user_id'
            },
            validate: {
                isInt: true
            }
        }
    }, {
        tableName: "conversation",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return Conversation;
}