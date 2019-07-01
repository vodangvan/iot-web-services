"use strict";
module.exports = function(sequelize, DataTypes) {
  var Material = sequelize.define("material", {
    material_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    materialtype_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'material_type',
            key: 'materialtype_id'
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
    material_name:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    material_numberOfLot: DataTypes.STRING(50),
    material_source:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    material_quantity:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isFloat: true
        }
    },
    material_existence:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isFloat: true
        }
    },
    material_price:{
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isDecimal: true
        }
    },
    material_description:{
        type: DataTypes.STRING(1024),
        allowNull: true
    },
    material_state:{
         type: DataTypes.BOOLEAN,
        allowNull: false
    }
  }, 
  {
     tableName: "material",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Material.belongsTo(models.material_type, { foreignKey: 'materialtype_id', targetKey: 'materialtype_id', as: 'Material_Type'});
           Material.belongsTo(models.unit, { foreignKey: 'unit_id', targetKey: 'unit_id', as: 'Unit'});
           Material.belongsTo(models.bill, { foreignKey: 'bill_id', targetKey: 'bill_id', as: 'Bill'});
           Material.belongsToMany(models.activity,{ through: models.activity_material, foreignKey: 'material_id' });
           Material.belongsToMany(models.pond_preparation,{ through: models.material_preparation_detail, foreignKey: 'material_id' });
      }
    }
  });
  return Material;
};