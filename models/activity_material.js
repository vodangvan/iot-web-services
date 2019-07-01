"use strict";
module.exports = function(sequelize, DataTypes) {
  var Activity_Material = sequelize.define("activity_material", {
    material_id:{
        type: DataTypes.INTEGER,            
        references:{
            model: 'material',
            key: 'material_id'
        },
        primaryKey: true,
        allowNull: false
    },
    activity_id:{
        type: DataTypes.INTEGER,
        references:{
            model: 'activity',
            key: 'activity_id'
        },
        validate:  {
            isInt: true
        },
        primaryKey: true,
        allowNull: false
    },
    actimaterial_amount:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValues: 0,
        validate:  {
            isFloat: true
        }
    }
  }, 
  {
     tableName: "activity_material",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
      }
    }
  });
  
  return Activity_Material;
};