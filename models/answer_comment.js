"use strict";
module.exports = function(sequelize, DataTypes) {
  var Answer_Comment = sequelize.define("answer_comment", {
    anscom_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    comment_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'comment',
            key: 'comment_id'
        },
        validate:{
            isInt: true
        }
    },
    anscom_content:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    anscom_answreByName:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    anscom_answerByEmail:{
        type: DataTypes.STRING(200),
        allowNull: false
    },
    anscom_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    }
  }, 
  {
     tableName: "answer_comment",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
            Answer_Comment.belongsTo(models.comment, { foreignKey: 'comment_id', targetKey: 'comment_id', as: 'Comment'});
      }
    }
  });
  return Answer_Comment;
};