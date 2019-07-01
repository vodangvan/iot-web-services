"use strict";
module.exports = function(sequelize, DataTypes) {
  var Location_Manager = sequelize.define("location_manager", 
  {
      locaman_id: {
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true     
      },
      locaman_locationId:{
        type: DataTypes.STRING(5)
      },
      locaman_startDate:{
        type: DataTypes.DATE,
        defaultValue: sequelize.now
      },
      locaman_endDate:{
        type: DataTypes.DATE,
        defaultValue: sequelize.now,
        allowNull: true
      },
      locaman_levelManager:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate:{
            isInt: true
        }
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
     tableName: "location_manager",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           Location_Manager.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
      }
    }
  });
  return Location_Manager;
};