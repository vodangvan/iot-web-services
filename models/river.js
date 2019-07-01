"use strict";
module.exports = function(sequelize, DataTypes) {
  var River = sequelize.define("river", 
    {
        river_id:{
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },

        river_name:{
            type: DataTypes.STRING(255),
            allowNull: false
        },

        region_id:{
          type: DataTypes.INTEGER,
          allowNull: false,
          references:{
              model: 'region',
              key: 'region_id'
          },
          validate:{
              isInt: true
          }
        },

        river_description: DataTypes.STRING(1024),        
        river_location: DataTypes.STRING(30),
        river_latitude: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },
        river_longitude: {
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
        tableName: "river",
        timestamps: false,
        freezeTableName: true,  
        classMethods: {
            associate: function(models) {
              River.belongsTo(models.region,{ foreignKey: 'region_id', targetKey: 'region_id', as: 'Region'});
              River.hasMany(models.data, {foreignKey: 'river_id', targetKey: 'river_id'});
              River.hasMany(models.station, {foreignKey: 'river_id', targetKey: 'river_id'});
        }
    }
  });
  return River;
};
/** 
 * thêm mới 2 trường này
 * river_latitude: kinh độ thực trên bản đồ
 * river_longitude: vĩ độ thực trên bản đồ
 */