"use strict";
module.exports = function(sequelize, DataTypes) {
  var Notification_State = sequelize.define("notification_state", {
    user_id:{
        type: DataTypes.INTEGER,            
        references:{
            model: 'user',
            key: 'user_id'
        },
        primaryKey: true,
        allowNull: false,
        validate:{
            isInt: true
        }
    },
    notif_id:{
        type: DataTypes.BIGINT.UNSIGNED,
        references:{
            model: 'notification',
            key: 'notif_id'
        },
        primaryKey: true,
        allowNull: false,
        validate:{
            isInt: true
        }
    },
    notifstate_readTime:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValues: sequelize.NOW
    }
  }, 
  {
     tableName: "notification_state",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
            
        }
     }
  });
  return Notification_State;
};