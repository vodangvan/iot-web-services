"use strict";
module.exports = function(sequelize, DataTypes) {
  var Harvest_Detail = sequelize.define("harvest_detail", {
    harvedeta_number:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        validate:{
            isInt: true
        }    
    },
    harvest_id:{
        type: DataTypes.INTEGER,           
        primaryKey: true,
        allowNull: false,
        references:{
            model: 'harvest',
            key: 'harvest_id'
        },
        validate:{
            isInt: true
        }
    },
    prodtype_id:{
        type: DataTypes.INTEGER,           
        primaryKey: true,
        allowNull: false,
        references:{
            model: 'product_type',
            key: 'prodtype_id'
        },
        validate:{
            isInt: true
        }
    },
    pond_id: {
        type: DataTypes.INTEGER,        
        allowNull: false,
        references:{
            model: 'pond',
            key: 'pond_id'
        },
        validate:{
            isInt: true
        }
    },
    unit_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'unit',
            key: 'unit_id'
        },
        validate:{
            isInt: true
        }
    },
    harvedeta_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isDecimal: true
        }
    },
    harvedeta_weight:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isFloat: true
        }
    },
    harvedeta_note: DataTypes.STRING(500)
  }, 
  {
     tableName: "harvest_detail",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Harvest_Detail.belongsTo(models.pond, { foreignKey: 'pond_id', targetKey: 'pond_id', as: 'Pond'});
           Harvest_Detail.belongsTo(models.unit, { foreignKey: 'unit_id', targetKey: 'unit_id', as: 'Unit'});
      }
    }
  });
  return Harvest_Detail;
};