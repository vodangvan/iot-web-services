"use strict";
module.exports = function(sequelize, DataTypes) {
  var Age = sequelize.define("age", {
    age_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    age_valueMax:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        validate:  {
            isInt: true
        }
    },
    age_valueMin:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        validate:  {
            isInt: true
        }
    },
    age_description:{
        type: DataTypes.STRING(255),
        allowNull: false
    }
  }, 
  {
     tableName: "age",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           //Age.hasMany(models.stocking, { foreignKey: 'age_id', targetKey: 'age_id'});
           Age.hasMany(models.threshold, { foreignKey: 'age_id', targetKey: 'age_id'});
      }
    }
  });
  return Age;
};