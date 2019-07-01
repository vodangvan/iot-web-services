"use strict";
module.exports = function(sequelize, DataTypes) {
  var Sink = sequelize.define("sink", 
    {
        sink_id:{
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },

        region_id:{
          type: DataTypes.INTEGER,
          allowNull: false,
          references:{
              model: 'region',
              key: 'region_id'
          }
        },

        sink_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        sink_code: {
           type: DataTypes.STRING(16),
           unique: true
        },
        sink_secret: DataTypes.STRING(16),
        sink_location: {
            type: DataTypes.STRING(30)
        },
        
        sink_status: {
            type: DataTypes.BOOLEAN
        },

        sink_address: DataTypes.STRING(255),
        sink_latitude: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },
        sink_longitude: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },
        isDelete: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, 
    {
        tableName: "sink",
        timestamps: false,
        freezeTableName: true,  // disable the modification of table names; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural.
        classMethods: {
            associate: function(models) {
                Sink.belongsTo(models.region ,{ foreignKey: 'region_id', targetKey: 'region_id', as: 'Region'});
                Sink.hasMany(models.station, {foreignKey:'sink_id', targetKey: 'sink_id'});
                Sink.hasMany(models.data, {foreignKey: { name: 'sink_id'}, allowNull: true , constraints: false, targetKey: 'sink_id'});
        }
    }
  });
  return Sink;
};
/** 
 * thêm mới 2 trường này
 * sink_latitude: kinh độ thực trên bản đồ
 * sink_longitude: vĩ độ thực trên bản đồ
 */