"use strict";
module.exports = function(sequelize, DataTypes) {
  var Region_Manager = sequelize.define("region_manager", {
    user_id:{
        type: DataTypes.INTEGER,            
        references:{
            model: 'user',
            key: 'user_id'
        },
        primaryKey: true,
        allowNull: false,
        validate:{
            isInt: true
        }
    },
    region_id:{
        type: DataTypes.INTEGER,
        references:{
            model: 'region',
            key: 'region_id'
        },
        primaryKey: true,
        allowNull: false,
        validate:{
            isInt: true
        }
    }
  }, 
  {
     tableName: "region_manager",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           //this.belongsTo(models.user, {foreignKey:'user_id',  targetKey: 'user_id', as: 'User'});
           //this.belongsTo(models.region, {foreignKey:'region_id',  targetKey: 'region_id', as: 'Region'});

      }
    }
  });
  return Region_Manager;
};