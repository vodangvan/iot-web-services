"use strict";
module.exports = function(sequelize, DataTypes) {
  var Stocking = sequelize.define("stocking", {
    stocking_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    stockingtype_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking_type',
            key: 'stockingtype_id'
        }
    },
    species_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'species',
            key: 'species_id'
        }
    },
    // age_id:{
    //     type: DataTypes.INTEGER,
    //     allowNull: false,
    //     references:{
    //         model: 'age',
    //         key: 'age_id'
    //     }
    // },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'user',
            key: 'user_id'
        }
    },
    stocking_quantity:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate:{
            isInt: true
        } 
    },
    stocking_note: DataTypes.TEXT,
    stocking_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: sequelize.NOW
    },
    stocking_status:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
  }, 
  {
     tableName: "stocking",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Stocking.belongsTo(models.stocking_type, {foreignKey:'stockingtype_id',  targetKey: 'stockingtype_id', as: 'Stocking_Type'});
           Stocking.belongsTo(models.species, {foreignKey:'species_id',  targetKey: 'species_id', as: 'Species'});
           //Stocking.belongsTo(models.age, {foreignKey:'age_id',  targetKey: 'age_id', as: 'Age'});           
           Stocking.hasMany(models.bill,{ foreignKey: 'stocking_id', targetKey: 'stocking_id'});
           Stocking.hasMany(models.harvest,{ foreignKey: 'stocking_id', targetKey: 'stocking_id'});
           Stocking.hasMany(models.pond_preparation,{ foreignKey: 'stocking_id', targetKey: 'stocking_id'});
           Stocking.belongsToMany(models.pond,{ through: models.stocking_pond, foreignKey: 'stocking_id' });
           Stocking.belongsTo(models.user, {foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
      }
    }
  });
  return Stocking;
};