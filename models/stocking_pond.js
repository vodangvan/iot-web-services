"use strict";
module.exports = function(sequelize, DataTypes) {
  var Stocking_Pond = sequelize.define("stocking_pond", {
    stocking_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        references:{
            model: 'stocking',
            key: 'stocking_id'
        }     
    },
    pond_id:{
        type: DataTypes.INTEGER,
        allowNull: false,        
        primaryKey: true,
        references:{
            model: 'pond',
            key: 'pond_id'
        },
        validate:{
            isInt: true
        } 
    },
    seed_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'seed',
            key: 'seed_id'
        },
        validate:{
            isInt: true
        } 
    },
    stockpond_date:{
        type:  DataTypes.DATE,
        allowNull: false
    },
    stockpond_PCR:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    stockpond_PCRresult:{
        type:  DataTypes.STRING(100)
    },
    stockpond_density:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        } 
    },
    stockpond_quantityStock:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        } 
    },
    stockpond_statusOfSeed:{
        type:  DataTypes.BOOLEAN,
        allowNull: false
    },
    stockpond_method:{
        type:  DataTypes.STRING(1024)
    },
    stockpond_depth:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    stockpond_clarity:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    stockpond_salinity:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    stockpond_DO:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    stockpond_PHwater:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    stockpond_tempAir:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    stockpond_tempWater:{
        type:  DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        } 
    },
    stockpond_state:{
        type:  DataTypes.BOOLEAN,
        allowNull: false
    },
    stockpond_age:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        }        
    }
  }, 
  {
     tableName: "stocking_pond",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Stocking_Pond.hasMany(models.tracker_augmented, {foreignKey: 'pond_id', targetKey: 'pond_id'},{foreignKey: 'stocking_id', targetKey: 'stocking_id'});
           Stocking_Pond.hasMany(models.activity, {foreignKey: 'pond_id', targetKey: 'pond_id'},{foreignKey: 'stocking_id', targetKey: 'stocking_id'});
           Stocking_Pond.hasMany(models.pond, {foreignKey: 'pond_id', targetKey: 'pond_id', as: 'Pond'});
           Stocking_Pond.hasMany(models.stocking, {foreignKey: 'stocking_id', targetKey: 'stocking_id', as: 'Stocking'});
           Stocking_Pond.belongsTo(models.seed, {foreignKey:'seed_id',  targetKey: 'seed_id', as: 'Seed'});
      }
    }
  });
  return Stocking_Pond;
};