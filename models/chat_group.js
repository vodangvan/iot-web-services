"use strict";
module.exports = function(sequelize, DataTypes) {
    var ChatGroup = sequelize.define("chat_group", {
        chatgroup_id: {
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
        chatgroup_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: "chat_group",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return ChatGroup;
};