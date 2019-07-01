"use strict";
module.exports = function(sequelize, DataTypes) {
  var Species = sequelize.define("species", {
    species_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    species_name:{
        type: DataTypes.STRING(50),
        allowNull: false
    }
  }, 
  {
     tableName: "species",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Species.hasMany(models.stocking, {foreignKey:'species_id',  targetKey: 'species_id'});
           Species.hasMany(models.threshold, {foreignKey:'species_id',  targetKey: 'species_id'});
      }
    }
  });
  return Species;
};