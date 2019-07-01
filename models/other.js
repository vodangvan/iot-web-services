"use strict";
module.exports = function(sequelize, DataTypes) {
  var Other = sequelize.define("other", {
    other_id:{
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
    other_name:{
        type: DataTypes.STRING(255),
        allowNull: false
    },
    other_price:{
        type: DataTypes.DECIMAL,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isDecimal: true
        }
    },
    other_quantity:{
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValues: 0,
        validate:{
            isFloat: true
        }
    },
    other_note:{
         type: DataTypes.STRING(1024),
        allowNull: true
    }
  }, 
  {
     tableName: "other",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Other.belongsTo(models.bill, { foreignKey: 'bill_id', targetKey: 'bill_id', as: 'Bill'});
      }
    }
  });
  return Other;
};