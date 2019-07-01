"use strict";
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define("post", {
    post_id:{
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
    postcate_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'post_category',
            key: 'postcate_id'
        },
        validate:{
            isInt: true
        }
    },
    post_title:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    post_smallPicture:{
        type: DataTypes.STRING(500)
    },
    post_description: DataTypes.STRING(500),
    post_createBy:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    post_createDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    },
    post_updateBy: DataTypes.STRING(100),
    post_updateDate: DataTypes.DATE,
    post_picture:{
        type: DataTypes.STRING(1024)
    },
    post_isDelete:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValues: false
    },
    post_isPublic:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValues: false
    },
    post_content:{
        type: DataTypes.TEXT
    }
  }, 
  {
     tableName: "post",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
            Post.belongsTo(models.post_category, { foreignKey: 'postcate_id', targetKey: 'postcate_id', as: 'Post_Category'});
            Post.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
            Post.hasMany(models.media, { foreignKey: 'post_id', targetKey: 'post_id'});
            Post.hasMany(models.comment, { foreignKey: 'post_id', targetKey: 'post_id', onDelete: 'cascade'});
      }
    }
  });
  return Post;
};