"use strict";
module.exports = function(sequelize, DataTypes) {
  var Notification = sequelize.define("notification", {
    notif_id:{
        type: DataTypes.BIGINT.UNSIGNED,            
        primaryKey: true,
        autoIncrement: true        
    },
    threshold_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'threshold',
            key: 'threshold_id'
        }
    },
    data_id:{
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references:{
            model: 'data',
            key: 'data_id'
        }
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'user',
            key: 'user_id'
        }
    },
    region_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: 'region',
            key: 'region_id'
        }
    },
    notif_title:{
        type:  DataTypes.STRING(255),
        allowNull: false
    },
    /*notif_readState:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },*/
    notif_createdDate:{
        type: DataTypes.DATE,
        defaultValue: sequelize.NOW
    },
    notif_type:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        }
    }
  }, 
  {
     tableName: "notification",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {
           Notification.belongsTo(models.threshold, {foreignKey:'threshold_id',  targetKey: 'threshold_id', as: 'Threshold'});
           Notification.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
           Notification.belongsTo(models.data, {foreignKey: 'data_id', targetKey: 'data_id', as: 'Data'});
           Notification.belongsTo(models.region, { foreignKey: 'region_id', targetKey: 'region_id', as: 'Region'});
           Notification.belongsToMany(models.user,{ through: models.notification_state, foreignKey: 'notif_id' });
      }
    }
  });
  return Notification;
};