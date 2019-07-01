"use strict";
module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("user", {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        user_fullName: {
            type: DataTypes.STRING(50),
            allowNull: false
        },

        user_userName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notContains: ' '
            }
        },

        user_birthday: DataTypes.DATEONLY,

        user_phone: {
            type: DataTypes.STRING(15),
            allowNull: false
        },

        user_email: {
            type: DataTypes.STRING(100),
            validate: {
                isEmail: true
            }
        },

        user_password: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                notContains: ' '
            }
        },

        user_address: DataTypes.STRING(500),

        user_onlineStatus: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        user_sendSms: {
            type: DataTypes.BOOLEAN,
            default: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'role',
                key: 'role_id'
            }
        },
        user_levelManager: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                isInt: true
            }
        },
        user_lockStatus: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        tableName: "user",
        timestamps: false,
        freezeTableName: true, // disable the modification of table names; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural.
        classMethods: {
            associate: function(models) {
                User.belongsTo(models.role, { foreignKey: 'role_id', targetKey: 'role_id', as: 'Role' });
                //this.hasMany(models.region_manager, {foreignKey: 'user_id', targetKey: 'user_id', as: 'Region_Managers'});
                User.belongsToMany(models.region, { through: models.region_manager, foreignKey: 'user_id' });
                User.belongsToMany(models.station, { through: models.block_notification, foreignKey: 'user_id' });
                User.belongsToMany(models.station, { through: models.station_default, foreignKey: 'user_id' });
                User.belongsToMany(models.notification, { through: models.notification_state, foreignKey: 'user_id' });
                User.belongsToMany(models.function, { through: models.user_function, foreignKey: 'user_id' });
                User.belongsToMany(models.function_group, { through: models.user_function_group, foreignKey: 'user_id' });
                User.hasMany(models.location_manager, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.lock_history, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.pond, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.advice, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.notification, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.bill, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.harvest, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.post, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.feedback, { foreignKey: 'user_id', targetKey: 'user_id' });
                User.hasMany(models.stocking, { foreignKey: 'user_id', targetKey: 'user_id' });
            }
        }
    });
    return User;

};