"use strict";
module.exports = function(sequelize, DataTypes) {
    var User_function_group = sequelize.define("user_function_group", {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            },
            primaryKey: true,
            allowNull: false
        },
        function_group_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'function_group',
                key: 'function_group_id'
            },
            primaryKey: true,
            allowNull: false,
            validate: {
                isInt: true
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: "user_function_group",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return User_function_group;
};