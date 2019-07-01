"use strict";
module.exports = function(sequelize, DataTypes) {
    var Vote = sequelize.define("vote", {
        vote_id: {
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
        reply_id: {
            type: DataTypes.INTEGER
        },
        vote_time: {
            type: DataTypes.DATE,
            defaultValues: sequelize.NOW,
            allowNull: false
        }
    }, {
        tableName: "vote",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return Vote;
};