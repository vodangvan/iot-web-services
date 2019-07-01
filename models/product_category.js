"use strict";
module.exports = function(sequelize, DataTypes) {
  var Product_Category = sequelize.define("product_category", {
    prodcate_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    prodcate_name:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    prodcate_image:{
        type: DataTypes.STRING(500)
    },
    prodcate_description: DataTypes.STRING(500),
    prodcate_createBy:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    prodcate_createDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    },
    prodcate_updateBy: DataTypes.STRING(100),
    prodcate_updateDate: DataTypes.DATE,
    prodcate_isDelete:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValues: false
    }
  }, 
  {
     tableName: "product_category",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
        //    Material.belongsTo(models.material_type, { foreignKey: 'materialtype_id', targetKey: 'materialtype_id', as: 'Material_Type'});
        //    Material.belongsTo(models.unit, { foreignKey: 'unit_id', targetKey: 'unit_id', as: 'Unit'});
        //    Material.belongsTo(models.bill, { foreignKey: 'bill_id', targetKey: 'bill_id', as: 'Bill'});
        //    Material.belongsToMany(models.activity,{ through: models.activity_material, foreignKey: 'material_id' });
           Product_Category.hasMany(models.product_type, { foreignKey: 'prodcate_id', targetKey: 'prodcate_id'});
      }
    }
  });
  return Product_Category;
};