"use strict";
module.exports = function(sequelize, DataTypes) {
  var Pond = sequelize.define("pond", 
    {
        pond_id:{
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },

        region_id:{
          type: DataTypes.INTEGER,
          allowNull: false,
          references:{
              model: 'region',
              key: 'region_id'
          },
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
        },

        pond_width: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },
        
        pond_height: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },
        
        pond_depth: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },

        pond_description: DataTypes.STRING(1024),        
        pond_status:{
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        pond_location: DataTypes.STRING(30),

        pond_address: DataTypes.STRING(255),
        pond_latitude: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },
        pond_longitude: {
            type: DataTypes.FLOAT,
            validate:{
                min: 0, 
                isFloat: true
            }
        },
        isDelete:{
            type: DataTypes.BOOLEAN,
            allowNull: false
        }       
    }, 
    {
        tableName: "pond",
        timestamps: false,
        freezeTableName: true,  // disable the modification of table names; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural.
        classMethods: {
            associate: function(models) {
              Pond.belongsTo(models.region,{ foreignKey: 'region_id', targetKey: 'region_id', as: 'Region'});
              Pond.belongsTo(models.user, { foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
              Pond.hasMany(models.data, {foreignKey: 'pond_id', targetKey: 'pond_id'});
              Pond.hasMany(models.harvest_detail, {foreignKey: 'pond_id', targetKey: 'pond_id'});
              Pond.hasMany(models.pond_preparation, {foreignKey: 'pond_id', targetKey: 'pond_id'});
              Pond.belongsToMany(models.stocking,{ through: models.stocking_pond, foreignKey: 'pond_id' });
              //Pond.hasMany(models.tracker_augmented, {foreignKey: 'pond_id', targetKey: 'pond_id'});
        }
    }
  });
  return Pond;
};