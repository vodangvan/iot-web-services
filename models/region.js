"use strict";
module.exports = function(sequelize, DataTypes) {
  var Region = sequelize.define("region", {
    region_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    region_name:{
        type: DataTypes.STRING(255),
        allowNull: false
    },    
    region_description: DataTypes.STRING(1024),
    ward_id: {
        type: DataTypes.STRING(5),
        references: {
          model: 'ward',
          key: 'ward_id'
        }
    }
  }, 
  {
     tableName: "region",
     timestamps: false,
     freezeTableName: true,
     classMethods: {
        associate: function(models) {
           Region.belongsTo(models.ward, {foreignKey:'ward_id',  targetKey: 'ward_id', as: 'Ward'});
           Region.belongsToMany(models.user,{ through: models.region_manager, foreignKey: 'region_id' });
           Region.hasMany(models.pond, {foreignKey: 'region_id', targetKey: 'region_id'});
           Region.hasMany(models.river, {foreignKey: 'region_id', targetKey: 'region_id'});
           Region.hasMany(models.sink, {foreignKey: 'region_id', targetKey: 'region_id'});
           Region.hasMany(models.station, {foreignKey: 'region_id', targetKey: 'region_id'});
           Region.hasMany(models.threshold, {foreignKey: 'region_id', targetKey: 'region_id'});
           Region.hasMany(models.notification, {foreignKey: 'region_id', targetKey: 'region_id'});
      }
    }
  });
  return Region;
};