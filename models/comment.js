"use strict";
module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define("comment", {
    comment_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    comment_content:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    comment_commentByName:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    comment_commentByEmail:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    comment_commentDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    },
    post_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'post',
            key: 'post_id'
        },
        validate:{
            isInt: true
        }
    }
  }, 
  {
     tableName: "comment",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
            Comment.hasMany(models.answer_comment, { foreignKey: 'comment_id', targetKey: 'comment_id'});
            Comment.belongsTo(models.post, {foreignKey: 'post_id', targetKey: 'post_id', as: 'Post'});
      }
    }
  });
  return Comment;
};