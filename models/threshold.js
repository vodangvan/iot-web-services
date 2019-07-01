"use strict";
module.exports = function(sequelize, DataTypes) {
  var Threshold = sequelize.define("threshold", {
    threshold_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    datatype_id:{
        type: DataTypes.CHAR(3),
        allowNull: false,
        references:{
            model: 'data_type',
            key: 'datatype_id'
        }
    },
    region_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'region',
            key: 'region_id'
        }
    },
    age_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'age',
            key: 'age_id'
        }
    },
    species_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'species',
            key: 'species_id'
        }
    },
    threshold_name:{
        type:  DataTypes.STRING(255),
        allowNull: false
    },
    threshold_start:{
        type: DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    threshold_end:{
        type: DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    threshold_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        } 
    },
    threshold_message:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    threshold_createdDate:{
        type: DataTypes.DATE,
        defaultValue: sequelize.NOW
    },

    threshold_timeWarning:{
        type: DataTypes.INTEGER,
        allowNull: true,
        validate:{
            isInt: true
        } 
    },
    threshold_type:{
        type: DataTypes.BOOLEAN,
        allowNull:true
    }
  }, 
  {
     tableName: "threshold",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Threshold.belongsTo(models.data_type, {foreignKey:'datatype_id',  targetKey: 'datatype_id', as: 'Data_Type'});
           Threshold.belongsTo(models.age, {foreignKey:'age_id',  targetKey: 'age_id', as: 'Age'});
           Threshold.belongsTo(models.region, {foreignKey:'region_id',  targetKey: 'region_id', as: 'Region'});
           Threshold.belongsTo(models.species, {foreignKey:'species_id',  targetKey: 'species_id', as: 'Species'});
           Threshold.hasMany(models.advice, {foreignKey: 'threshold_id', targetKey: 'threshold_id'});
           Threshold.hasMany(models.notification,{ foreignKey: 'threshold_id', targetKey: 'threshold_id'});
      }
    }
  });
  return Threshold;
};
