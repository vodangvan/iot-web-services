"use strict";
module.exports = function(sequelize, DataTypes) {
  var Config_Type = sequelize.define("config_type", {
    configtype_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    configtype_name:{
        type:  DataTypes.STRING(255),
        allowNull: false
    },
    configtype_cmdKeyword:{
        type:  DataTypes.STRING(255),
        allowNull: false
    },
    configtype_variable:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    configtype_parentId:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'config_type',
            key: 'configtype_id'
        },
        validate:{
            isInt: true
        }
    },
    configtype_order:{
        type: DataTypes.INTEGER,
        validate:{
            isInt: true
        }
    },
    configtype_default:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    configtype_discription:{
        type: DataTypes.STRING(500),
        allowNull: true
    }
  }, 
  {
     tableName: "config_type",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Config_Type.hasMany(models.station_config, { foreignKey: 'configtype_id', targetKey: 'configtype_id'});
           Config_Type.hasMany(models.config_type, {foreignKey: 'configtype_parentId', targetKey: 'configtype_id'});
           Config_Type.belongsTo(models.config_type, {foreignKey: 'configtype_parentId', targetKey: 'configtype_id', as: 'Parent'})
      }
    }
  });
  return Config_Type;
};