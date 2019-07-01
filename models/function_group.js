"use strict";
module.exports = function(sequelize, DataTypes) {
    var _function_Group = sequelize.define("function_group", {
        function_group_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        role: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notContains: ''
            }
        },
        function_group_tag: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notContains: ''
            }
        },
        href: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notContains: ''
            }
        },
        description: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notContains: ''
            }
        }
    }, {
        tableName: "function_group",
        timestamps: false,
        freezeTableName: true, // disable the modification of table names; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural.
        classMethods: {
            associate: function(models) {
                _function_Group.belongsToMany(models.user, { through: models.user_function_group, foreignKey: 'function_group_id' });
            }
        }
    });
    return _function_Group;

};