"use strict";
module.exports = function(sequelize, DataTypes) {
    var Friend = sequelize.define("friend", {
        friend_id: {
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
        user_friendUserId: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        }
    }, {
        tableName: "friend",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return Friend;
};