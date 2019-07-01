"use strict";
module.exports = function(sequelize, DataTypes) {
  var Sensor = sequelize.define("sensor", {
    sensor_id:{
        type: DataTypes.BIGINT,            
        primaryKey: true,
        autoIncrement: true        
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
    datatype_id:{
        type: DataTypes.CHAR(3),
        allowNull: false,
        references:{
            model: 'data_type',
            key: 'datatype_id'
        }
    },
    sensor_name:{
        type:  DataTypes.STRING(100),
        allowNull: false
    },
    sensor_serialNumber:{
        type: DataTypes.STRING(50),
        unique: true
    }
  }, 
  {
     tableName: "sensor",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Sensor.belongsTo(models.station, {foreignKey:'station_id',  targetKey: 'station_id', as: 'Station'});
           Sensor.belongsTo(models.data_type, {foreignKey: 'datatype_id', targetKey: 'datatype_id', as: 'Data_Type'});
      }
    }
  });
  return Sensor;
};