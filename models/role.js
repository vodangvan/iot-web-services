"use strict";
module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define("role", 
    {
        role_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
        role_name:{
            type: DataTypes.STRING(20),
            allowNull: false,
          },
        role_description: DataTypes.STRING
    }, 
    {
        tableName: "role",
        timestamps: false,
        freezeTableName: true,
        classMethods: {
            associate: function(models) {
                Role.hasMany(models.user, {foreignKey:'role_id', targetKey: 'role_id'});
        }
    }
  })
  return Role;
};
