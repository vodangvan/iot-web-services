"use strict";
module.exports = function(sequelize, DataTypes) {
  var Tracker_Augmented = sequelize.define("tracker_augmented", {
    trackeraugmented_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    pond_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking_pond',
            key: 'pond_id'
        }
    },
    stocking_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking_pond',
            key: 'stocking_id'
        }
    },
    trackeraugmented_number:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        } 
    },
    trackeraugmented_date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    trackeraugmented_age:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate:{
            isInt: true
        } 
    },
    trackeraugmented_densityAvg:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate:{
            isFloat: true
        } 
    },
    trackeraugmented_weightAvg:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate:{
            isFloat: true
        } 
    },
    trackeraugmented_speedOfGrowth:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate:{
            isFloat: true
        } 
    },
    tracker_augmented_survival:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate:{
            isFloat: true
        } 
    },
    trackeraugmented_biomass:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate:{
            isFloat: true
        } 
    },
    trackeraugmented_note: DataTypes.STRING(1024)
  }, 
  {
     tableName: "tracker_augmented",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Tracker_Augmented.belongsTo(models.stocking_pond, {foreignKey:'pond_id',  targetKey: 'pond_id', as: 'Stocking_Pond'},{foreignKey:'stocking_id',  targetKey: 'stocking_id', as: 'Stocking_Pond'});          
      }
    }
  });
  return Tracker_Augmented;
};