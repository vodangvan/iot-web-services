"use strict";
module.exports = function(sequelize, DataTypes) {
  var Unit = sequelize.define("unit", {
    unit_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    unit_name:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    unit_description:{
        type: DataTypes.STRING(1024),
        allowNull: true
    }
  }, 
  {
     tableName: "unit",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Unit.hasMany(models.material, { foreignKey: 'unit_id', targetKey: 'unit_id'});
           Unit.hasMany(models.harvest_detail, { foreignKey: 'unit_id', targetKey: 'unit_id'});
      }
    }
  });
  return Unit;
};