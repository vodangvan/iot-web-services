"use strict";
module.exports = function(sequelize, DataTypes) {
  var Seed_Quality = sequelize.define("seed_quality", {
    seedquality_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    seedquality_name:{
        type: DataTypes.STRING(100),
        allowNull: false
    }
  }, 
  {
     tableName: "seed_quality",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Seed_Quality.hasMany(models.seed, {foreignKey:'seedquality_id',  targetKey: 'seedquality_id'});
      }
    }
  });
  return Seed_Quality;
};