"use strict";
module.exports = function(sequelize, DataTypes) {
  var Station = sequelize.define("station", {
    station_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    sink_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'sink',
            key: 'sink_id'
        }
    },
    region_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'region',
            key: 'region_id'
        }
    },
    river_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'river',
            key: 'river_id'
        }
    },
    pond_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'pond',
            key: 'pond_id'
        }
    },
    station_name:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    station_code: {
      type:  DataTypes.STRING(10),
      unique: true
    },
    station_location:  DataTypes.STRING(30),
    station_node: DataTypes.STRING(250),
    station_status:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    station_secret: DataTypes.STRING(10),
    station_address: DataTypes.STRING(255),
    station_duration:{
        type: DataTypes.BIGINT,
        defaultValues: 10
    },
    station_updateStatus:{
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    station_latitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    },
    station_longitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    },
    isDelete:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    }   
  }, 
  {
     tableName: "station",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Station.belongsTo(models.sink, {foreignKey: 'sink_id', targetKey: 'sink_id', as: 'Sink'});
           Station.belongsTo(models.region,{ foreignKey: 'region_id', targetKey: 'region_id', as: 'Region'});
           Station.hasMany(models.data, {foreignKey: 'station_id', targetKey: 'station_id'});
           Station.hasMany(models.sensor, {foreignKey: 'station_id', targetKey: 'station_id'});
           Station.belongsTo(models.river, {foreignKey:'river_id',  targetKey: 'river_id', as: 'River'});
           Station.belongsTo(models.pond, {foreignKey:'pond_id',  targetKey: 'pond_id', as: 'Pond'});
           Station.hasMany(models.station_config, {foreignKey: 'station_id', targetKey: 'station_id'});
           Station.belongsToMany(models.user,{ through: models.block_notification, foreignKey: 'station_id' });           
           Station.belongsToMany(models.user,{ through: models.station_default, foreignKey: 'station_id' });
      }
    }
  });
  return Station;
};
/** 
 * thêm mới 2 trường này
 * station_latitude: kinh độ thực trên bản đồ
 * station_longitude: vĩ độ thực trên bản đồ
 */