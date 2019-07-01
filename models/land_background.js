"use strict";
module.exports = function(sequelize, DataTypes) {
  var Land_Background = sequelize.define("land_background", {
    landbg_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    landbg_name:{
        type:  DataTypes.STRING(100),
        allowNull: false
    },
    landbg_description: DataTypes.STRING(255)
  }, 
  {
     tableName: "land_background",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
          Land_Background.hasMany(models.pond_preparation, { foreignKey: 'landbg_id', targetKey: 'landbg_id'});
      }
    }
  });
  return Land_Background;
};