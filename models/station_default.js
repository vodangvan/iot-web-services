"use strict";
module.exports = function(sequelize, DataTypes) {
  var Station_Default = sequelize.define("station_default", 
  {
    user_id:{
        type: DataTypes.INTEGER,            
        references:{
            model: 'user',
            key: 'user_id'
        },
        primaryKey: true,
        allowNull: false
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
     tableName: "station_default",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           
      }
    }
  });
  return Station_Default;
};