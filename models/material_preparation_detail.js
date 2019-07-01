"use strict";
module.exports = function(sequelize, DataTypes) {
  var Material_Preparation_Detail = sequelize.define("material_preparation_detail", {
    pondpreparation_id:{
        type: DataTypes.INTEGER,            
        references:{
            model: 'pond_preparation',
            key: 'pondpreparation_id'
        },
        primaryKey: true,
        allowNull: false
    },
    material_id:{
        type: DataTypes.INTEGER,
        references:{
            model: 'material',
            key: 'material_id'
        },
        primaryKey: true,
        allowNull: false,
        validate:{
            isInt: true
        }
    },
    matepredetail_number:{
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        validate:{
            isInt: true
        }
    },
    matepredetail_quantity:{
        type: DataTypes.FLOAT,
        allowNull: false,
        validate:{
            isFloat: true
        }
    },
    matepredetail_date:{
        type: DataTypes.DATE,
        allowNull: false
    },
    matepredetail_note: DataTypes.STRING(1024)
  }, 
  {
     tableName: "material_preparation_detail",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
      }
    }
  });
  return Material_Preparation_Detail;
};