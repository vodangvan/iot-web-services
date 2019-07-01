"use strict";
module.exports = function(sequelize, DataTypes) {
    var _Function = sequelize.define("function", {
        function_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        function_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notContains: ''
            }
        },
        function_href: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notContains: ''
            }
        },
        function_tag: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notContains: ''
            }
        },
        description: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notContains: ''
            }
        }

    }, {
        tableName: "function",
        timestamps: false,
        freezeTableName: true, // disable the modification of table names; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural.
        classMethods: {
            associate: function(models) {
                _Function.belongsToMany(models.user, { through: models.user_function, foreignKey: 'function_id' });
            }
        }
    });
    return _Function;

};