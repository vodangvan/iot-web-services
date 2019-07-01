"use strict";
module.exports = function(sequelize, DataTypes) {
  var District = sequelize.define("district", {
    district_id:{
        type: DataTypes.STRING(5),            
        primaryKey: true,
        unique: true       
    },
    district_name:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    district_type: DataTypes.STRING(50),
    district_location: DataTypes.STRING(30),
    province_id: {
        type: DataTypes.STRING(5),
        references: {
          model: 'province',
          key: 'province_id'
        }
    }
    /*
    ,
    district_latitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    },
    district_longitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    }
    */

  }, 
  {
     tableName: "district",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           District.belongsTo(models.province, {foreignKey:'province_id',  targetKey: 'province_id', as: 'Province'});
           District.hasMany(models.ward, {foreignKey: 'district_id', targetKey: 'district_id'});
      }
    }
  });
  return District;
};