"use strict";
module.exports = function(sequelize, DataTypes) {
    var Thread = sequelize.define("thread", {
        thread_id: {
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
        thread_title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        thread_time: {
            type: DataTypes.DATE,
            //defaultValues: sequelize.NOW,
            allowNull: false
        },
        thread_views: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValues: 0
        },
        thread_votes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValues: 0
        },
        thread_replies: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValues: 0
        },
        thread_content: {
            type: DataTypes.TEXT
        },
        thread_lastEdit: {
            type: DataTypes.DATE //,
                //defaultValues: sequelize.NOW
        },
        thread_tag: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    }, {
        tableName: "thread",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return Thread;
};