"use strict";
module.exports = function(sequelize, DataTypes) {
  var Station_Config = sequelize.define("station_config", {
    stationconfig_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    configtype_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'config_type',
            key: 'configtype_id'
        },
        validate:{
            isInt: true
        } 
    },
    station_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'station',
            key: 'station_id'
        },
        validate:{
            isInt: true
        } 
    },
    stationconfig_value:{
        type:  DataTypes.STRING(255),
        allowNull: false
    },
    stationconfig_status:{
        type:  DataTypes.BOOLEAN,
        allowNull: true
    },
    stationconfig_createDate:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    }
  }, 
  {
     tableName: "station_config",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Station_Config.belongsTo(models.config_type, { foreignKey: 'configtype_id', targetKey: 'configtype_id', as: 'Config_Type'});
           Station_Config.belongsTo(models.station, { foreignKey: 'station_id', targetKey: 'station_id', as: 'Station'});
      }
    }
  });
  return Station_Config;
};