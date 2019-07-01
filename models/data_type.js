"use strict";
module.exports = function(sequelize, DataTypes) {
  var Data_Type = sequelize.define("data_type", {
    datatype_id:{
        type: DataTypes.CHAR(3),            
        primaryKey: true,               
    },
    datatype_name:{
        type: DataTypes.STRING(255),
        allowNull: false
    },    
    datatype_description: DataTypes.STRING(1024),
    datatype_unit:{
      type: DataTypes.STRING(20),
      allowNull: false
    },
    datatype_minValue:{
      type: DataTypes.FLOAT,
      allowNull: true,
      validate:{
          isFloat: true
      }
    },
    datatype_maxValue:{
      type: DataTypes.FLOAT,
      allowNull: true,
      validate:{
          isFloat: true
      }
    },
  }, 
  {
     tableName: "data_type",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           Data_Type.hasMany(models.data, {foreignKey: 'datatype_id', targetKey: 'datatype_id'});
           Data_Type.hasMany(models.sensor, {foreignKey: 'datatype_id', targetKey: 'datatype_id'});
           Data_Type.hasMany(models.threshold, {foreignKey: 'datatype_id', targetKey: 'datatype_id'});
      }
    }
  });
  return Data_Type;
};