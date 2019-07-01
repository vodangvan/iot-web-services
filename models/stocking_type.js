"use strict";
module.exports = function(sequelize, DataTypes) {
  var Stocking_Type = sequelize.define("stocking_type", {
    stockingtype_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    stockingtype_name:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    stockingtype_description:{
        type: DataTypes.STRING(1024),
        allowNull: true
    }
  }, 
  {
     tableName: "stocking_type",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Stocking_Type.hasMany(models.stocking, { foreignKey: 'stockingtype_id', targetKey: 'stockingtype_id'});
           //Age.hasMany(models.threshold, { foreignKey: 'age_id', targetKey: 'age_id'});
      }
    }
  });
  return Stocking_Type;
};