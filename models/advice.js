"use strict";
module.exports = function(sequelize, DataTypes) {
  var Advice = sequelize.define("advice", {
    advice_id:{
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
    threshold_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'threshold',
            key: 'threshold_id'
        },
        validate:{
            isInt: true
        }
    },
    advice_title: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    advice_message:{
        type:  DataTypes.TEXT,
        allowNull: false
    },
    advice_createdDate:{
        type: DataTypes.DATE,
        defaultValue: sequelize.NOW
    }
  }, 
  {
     tableName: "advice",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Advice.belongsTo(models.user, {foreignKey:'user_id',  targetKey: 'user_id', as: 'User'});
           Advice.belongsTo(models.threshold, {foreignKey:'threshold_id',  targetKey: 'threshold_id', as: 'Threshold'});
      }
    }
  });
  return Advice;
};