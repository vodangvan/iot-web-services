"use strict";
module.exports = function(sequelize, DataTypes) {
  var Feedback = sequelize.define("feedback", {
    feedback_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'user',
            key: 'user_id'
        },
        validate:{
            isInt: true
        }
    },
    feedback_name:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    feedback_email:{
        type: DataTypes.STRING(200),
        allowNull: false,
        validate:{
            isEmail: true
        }
    },
    feedback_message:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    feedback_status:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    feedback_createDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    },
    feedback_answerContent: DataTypes.STRING(500),
    feedback_answerDate: DataTypes.DATE
  }, 
  {
     tableName: "feedback",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
            Feedback.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
      }
    }
  });
  return Feedback;
};