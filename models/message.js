"use strict";
module.exports = function(sequelize, DataTypes) {
    var Message = sequelize.define("message", {
        message_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        conversation_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'conversation',
                key: 'conversation_id'
            },
            validate: {
                isInt: true
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            },
        },
        message_time: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValues: sequelize.NOW
        },
        message_content: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: "message",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return Message;
};