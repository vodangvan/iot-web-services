"use strict";
module.exports = function(sequelize, DataTypes) {
  var Bill = sequelize.define("bill", {
    bill_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'user',
            key: 'user_id'
        },
        validate:{
            isInt: true
        }
    },
    stocking_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'stocking',
            key: 'stocking_id'
        },
        validate:{
            isInt: true
        }
    },
    bill_createDate:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    },
    bill_total:{
        type: DataTypes.DECIMAL,
        allowNull: true,
        defaultValues: 0,
        validate:{
            isDecimal: true
        }
    },
    bill_dateInBill:{
         type: DataTypes.DATEONLY,
        allowNull: false
    }
  }, 
  {
     tableName: "bill",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Bill.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
           Bill.belongsTo(models.stocking, { foreignKey: 'stocking_id', targetKey: 'stocking_id', as: 'Stocking'});
           Bill.hasMany(models.other, { foreignKey: 'bill_id', targetKey: 'bill_id'});
           Bill.hasMany(models.material, { foreignKey: 'bill_id', targetKey: 'bill_id'});
           Bill.hasMany(models.seed, { foreignKey: 'bill_id', targetKey: 'bill_id'});
      }
    }
  });
  return Bill;
};