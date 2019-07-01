"use strict";
module.exports = function(sequelize, DataTypes) {
  var Pond_Preparation = sequelize.define("pond_preparation", {
    pondpreparation_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    pond_id:{
        type:  DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'pond',
            key: 'pond_id'
        },
        validate:{
            isInt: true
        }
    },
    stocking_id: {
        type:  DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking',
            key: 'stocking_id'
        },
        validate:{
            isInt: true
        }
    },
    landbg_id: {
        type:  DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'land_background',
            key: 'landbg_id'
        },
        validate:{
            isInt: true
        }
    },
    pondpreparation_dateStart:{
        type: DataTypes.DATE,
        allowNull: false,    
    },
    pondpreparation_soilPH:{
        type: DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        }
    },
    pondpreparation_capacityOfFan:{
        type: DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        }
    },
    pondpreparation_quantityOfFan:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isInt: true
        }
    }
  }, 
  {
     tableName: "pond_preparation",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
            Pond_Preparation.belongsTo(models.pond, { foreignKey: 'pond_id', targetKey: 'pond_id', as: 'Pond'});
            Pond_Preparation.belongsTo(models.stocking, { foreignKey: 'stocking_id', targetKey: 'stocking_id', as: 'Stocking'});
            Pond_Preparation.belongsTo(models.land_background, { foreignKey: 'landbg_id', targetKey: 'landbg_id', as: 'Land_Background'});
            Pond_Preparation.belongsToMany(models.material,{ through: models.material_preparation_detail, foreignKey: 'pondpreparation_id' });
      }
    }
  });
  return Pond_Preparation;
};
