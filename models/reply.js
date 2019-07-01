"use strict";
module.exports = function(sequelize, DataTypes) {
    var Reply = sequelize.define("reply", {
        reply_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            }
        },
        thread_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'thread',
                key: 'thread_id'
            }
        },
        reply_index: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reply_time: {
            type: DataTypes.DATE,
            defaultValues: sequelize.NOW,
            allowNull: false
        },
        reply_content: {
            type: DataTypes.TEXT
        },
        reply_lastEdit: {
            type: DataTypes.DATE
        },
        reply_votes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValues: 0
        }
    }, {
        tableName: "reply",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return Reply;
};