"use strict";
module.exports = function(sequelize, DataTypes) {
  var Material_Type = sequelize.define("material_type", {
    materialtype_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    materialtype_name:{
        type: DataTypes.STRING(255),
        allowNull: false
    }
  }, 
  {
     tableName: "material_type",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Material_Type.hasMany(models.material, { foreignKey: 'materialtype_id', targetKey: 'materialtype_id'});
           //Age.hasMany(models.threshold, { foreignKey: 'age_id', targetKey: 'age_id'});
      }
    }
  });
  return Material_Type;
};