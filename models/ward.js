"use strict";
module.exports = function(sequelize, DataTypes) {
  var Ward = sequelize.define("ward", {
    ward_id:{
        type: DataTypes.STRING(5),            
        primaryKey: true,
        unique: true   
    },
    ward_name:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ward_type: DataTypes.STRING(50),
    ward_location: DataTypes.STRING(30),
    district_id: {
        type: DataTypes.STRING(5),
        references: {
          model: 'district',
          key: 'district_id'
        }
    }
    /*
    ,
    ward_latitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    },
    ward_longitude: {
        type: DataTypes.FLOAT,
        validate:{
            min: 0, 
            isFloat: true
        }
    }
    */

  }, 
  {
     tableName: "ward",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           Ward.belongsTo(models.district, {foreignKey: 'district_id',  targetKey: 'district_id', as: 'District'});
           Ward.hasMany(models.region, {foreignKey: 'ward_id', targetKey: 'ward_id'});
      }
    }
  });
  return Ward;
};