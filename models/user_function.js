"use strict";
module.exports = function(sequelize, DataTypes) {
    var User_function = sequelize.define("user_function", {
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'user',
                key: 'user_id'
            },
            primaryKey: true,
            allowNull: false
        },
        function_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'function',
                key: 'function_id'
            },
            primaryKey: true,
            allowNull: false,
            validate: {
                isInt: true
            }
        },
        isactive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: "user_function",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return User_function;
};