"use strict";
module.exports = function(sequelize, DataTypes) {
  var Lock_History = sequelize.define("lock_history", 
  {
    lockhistory_id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lockhistory_lockDate:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.now
    },
    lockhistory_note:{
        type: DataTypes.STRING(500)
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
    }
  }, 
  {
     tableName: "lock_history",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           Lock_History.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
      }
    }
  });
  return Lock_History;
};