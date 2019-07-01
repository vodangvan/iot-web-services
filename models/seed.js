"use strict";
module.exports = function(sequelize, DataTypes) {
  var Seed = sequelize.define("seed", {
    seed_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    bill_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'bill',
            key: 'bill_id'
        },
        validate:{
            isInt: true
        }
    },
    seedquality_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'seed_quality',
            key: 'seedquality_id'
        },
        validate:{
            isInt: true
        }
    },
    seed_numberOfLot:{
        type:  DataTypes.STRING(50),
        allowNull: false
    },
    seed_quantity:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        }
    },
    seed_existence:{
        type:  DataTypes.INTEGER,
        validate:{
            isInt: true
        }
    },
    seed_price:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        }
    },
    seed_source:{
        type:  DataTypes.STRING(1024),
        allowNull: false
    },
    seed_size:{
        type:  DataTypes.FLOAT,
        allowNull: false
    }
  }, 
  {
     tableName: "seed",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Seed.belongsTo(models.bill, {foreignKey:'bill_id',  targetKey: 'bill_id', as: 'Bill'});
           Seed.belongsTo(models.seed_quality, {foreignKey:'seedquality_id',  targetKey: 'seedquality_id', as: 'Seed_Quality'});
           Seed.hasMany(models.stocking_pond, {foreignKey: 'seed_id', targetKey: 'seed_id'});
      }
    }
  });
  return Seed;
};