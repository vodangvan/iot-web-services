"use strict";
module.exports = function(sequelize, DataTypes) {
  var Post_Category = sequelize.define("post_category", {
    postcate_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    postcate_name:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    postcate_description: DataTypes.STRING(500),
    postcate_createBy:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    postcate_createDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    },
    postcate_updateBy: DataTypes.STRING(100),
    postcate_updateDate: DataTypes.DATE,
    postcate_picture:{
        type: DataTypes.STRING(255)
    },
    postcate_isDelete:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValues: false
    }
  }, 
  {
     tableName: "post_category",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
            Post_Category.hasMany(models.post, { foreignKey: 'postcate_id', targetKey: 'postcate_id'});
      }
    }
  });
  return Post_Category;
};