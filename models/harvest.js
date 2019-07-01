"use strict";
module.exports = function(sequelize, DataTypes) {
  var Harvest = sequelize.define("harvest", 
    {
        harvest_id:{
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
        stocking_id:{
          type: DataTypes.INTEGER,
          allowNull: false,
          references:{
              model: 'stocking',
              key: 'stocking_id'
          },
          validate:{
              isInt: true
          }
        },
        harvest_harvestDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, 
    {
        tableName: "harvest",
        timestamps: false,
        freezeTableName: true,  // disable the modification of table names; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural.
        classMethods: {
            associate: function(models) {
              Harvest.belongsTo(models.user,{ foreignKey: 'user_id', targetKey: 'user_id', as: 'User'});
              Harvest.belongsTo(models.stocking, { foreignKey: 'stocking_id', targetKey: 'stocking_id', as: 'Stocking'});
              Harvest.belongsToMany(models.product_type,{ through: models.harvest_detail, foreignKey: 'harvest_id' });
        }
    }
  });
  return Harvest;
};