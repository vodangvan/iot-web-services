"use strict";
module.exports = function(sequelize, DataTypes) {
  var Data = sequelize.define("data", {
    data_id:{
        type: DataTypes.BIGINT.UNSIGNED,            
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
    sink_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'sink',
            key: 'sink_id'
        },
        validate:{
            isInt: true
        }
    },
    pond_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'pond',
            key: 'pond_id'
        },
        validate:{
            isInt: true
        }
    },
    river_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'river',
            key: 'river_id'
        },
        validate:{
            isInt: true
        }
    },
    data_value:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        }
    },
    data_createdDate:{
        type: DataTypes.DATE
    },
    data_stationType:  DataTypes.BOOLEAN
  }, 
  {
     tableName: "data",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Data.belongsTo(models.station, {foreignKey:'station_id',  targetKey: 'station_id', as: 'Station'});
           Data.belongsTo(models.sink, {foreignKey:{ name: 'sink_id'}, allowNull: true, constraints: false,  targetKey: 'sink_id', as: 'Sink'});
           Data.belongsTo(models.pond, {foreignKey:'pond_id',  targetKey: 'pond_id', as: 'Pond'});
           Data.belongsTo(models.river, {foreignKey:'river_id',  targetKey: 'river_id', as: 'River'});
           Data.belongsTo(models.data_type, {foreignKey:'datatype_id',  targetKey: 'datatype_id', as: 'Data_Type'});
           Data.hasMany(models.notification,{ foreignKey: 'data_id', targetKey: 'data_id'});
      }
    }
  });
  return Data;
};