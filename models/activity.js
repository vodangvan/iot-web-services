"use strict";
module.exports = function(sequelize, DataTypes) {
  var Activity = sequelize.define("activity", 
    {
        activity_id:{
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        pond_id:{
          type: DataTypes.INTEGER,
          allowNull: false,
          references:{
              model: 'stocking_pond',
              key: 'pond_id'
          },
          validate:  {
              isInt: true
          }
        },
        stocking_id:{
          type: DataTypes.INTEGER,
          allowNull: false,
          references:{
              model: 'stocking_pond',
              key: 'stocking_id'
          },
          validate:  {
              isInt: true
          }
        },
        actitype_id:{
          type: DataTypes.INTEGER,
          allowNull: false,
          references:{
              model: 'activity_type',
              key: 'actitype_id'
          },
          validate:  {
              isInt: true
          }
        },
        activity_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        activity_note: DataTypes.STRING(1024)
    }, 
    {
        tableName: "activity",
        timestamps: false,
        freezeTableName: true,  // disable the modification of table names; By default, sequelize will automatically transform all passed model names (first parameter of define) into plural.
        classMethods: {
            associate: function(models) {
              Activity.belongsTo(models.stocking_pond, {foreignKey:'pond_id',  targetKey: 'pond_id', as: 'Stocking_Pond'},{foreignKey:'stocking_id',  targetKey: 'stocking_id', as: 'Stocking_Pond'});          
              Activity.belongsTo(models.activity_type, { foreignKey: 'actitype_id', targetKey: 'actitype_id', as: 'Activity_Type'});
              Activity.belongsToMany(models.material,{ through: models.activity_material, foreignKey: 'activity_id' });
        }
    }
  });
  return Activity;
};