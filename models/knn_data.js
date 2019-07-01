"use strict";
module.exports = function(sequelize, DataTypes) {
    var Knn_Data = sequelize.define("knn_data", {
        knn_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        knn_oxi: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        knn_ph: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        knn_temp: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        knn_nh4: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        knn_salinity: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        knn_evaluation: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    }, {
        tableName: "knn_data",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {

            }
        }
    });
    return Knn_Data;
};