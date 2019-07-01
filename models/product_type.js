"use strict";
module.exports = function(sequelize, DataTypes) {
  var Product_Type = sequelize.define("product_type", {
    prodtype_id:{
        type: DataTypes.INTEGER,        
        primaryKey: true,
        autoIncrement: true  
    },
    prodtype_typeName:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    prodcate_id:{
        type: DataTypes.INTEGER,   
        allowNull: false,
        references:{
            model: 'product_category',
            key: 'prodcate_id'
        },
        validate:{
            isInt: true
        }     
    }
  }, 
  {
     tableName: "product_type",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
           Product_Type.belongsTo(models.product_category, { foreignKey: 'prodcate_id', targetKey: 'prodcate_id', as: 'Product_Category'});
           Product_Type.belongsToMany(models.harvest,{ through: models.harvest_detail, foreignKey: 'prodtype_id' });
      }
    }
  });
  return Product_Type;
};