"use strict";
module.exports = function(sequelize, DataTypes) {
  var Province = sequelize.define("province", 
  {
    province_id:{
        type: DataTypes.STRING(5),            
        primaryKey: true,
        unique: true    
    },
    province_name:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    province_type: DataTypes.STRING(50),
    province_location: DataTypes.STRING(30)
    /*
    ,
    province_latitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    },
    province_longitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    }
    */

  }, 
  {
     tableName: "province",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           Province.hasMany(models.district, {foreignKey:'province_id',  targetKey: 'province_id'});
      }
    }
  });
  return Province;
};