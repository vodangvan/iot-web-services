"use strict";
module.exports = function(sequelize, DataTypes) {
  var Block_Notification = sequelize.define("block_notification", {
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
    station_id:{
        type: DataTypes.INTEGER,
        references:{
            model: 'station',
            key: 'station_id'
        },
        primaryKey: true,
        allowNull: false,
        validate:{
            isInt: true
        }
    }
  }, 
  {
     tableName: "block_notification",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
      }
    }
  });
  return Block_Notification;
};