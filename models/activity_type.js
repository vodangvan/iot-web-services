"use strict";
module.exports = function(sequelize, DataTypes) {
  var Activity_Type = sequelize.define("activity_type", {
    actitype_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    actitype_name:{
        type: DataTypes.STRING(255),
        allowNull: false
    }
  }, 
  {
     tableName: "activity_type",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Activity_Type.hasMany(models.activity, { foreignKey: 'actitype_id', targetKey: 'actitype_id'});
      }
    }
  });
  return Activity_Type;
};