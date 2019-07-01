"use strict";
module.exports = function(sequelize, DataTypes){
    var Sick = sequelize.define("sick",
        {
            sick_id:{
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            stocking_id:{
                type: DataTypes.INTEGER,            
                primaryKey: true,
                references:{
                    model: 'stocking',
                    key: 'stocking_id'
                }     
            },
            pond_id:{
                type: DataTypes.INTEGER,
                allowNull: false,        
                primaryKey: true,
                references:{
                    model: 'pond',
                    key: 'pond_id'
                },
                validate:{
                    isInt: true
                } 
            },
            sick_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            sick_image: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            sick_description: {
                type: DataTypes.STRING(1024),
                allowNull: true
            },
            sick_createdDate:{
                type: DataTypes.DATE
            },
        },
        {
            tableName: "sick",
            timestamps: false,
            freezeTableName: true,  
            classMethods: {
                 associate: function(models) {
                    Sick.hasMany(models.agent, {foreignKey: 'sick_id', targetKey: 'sick_id'});
                    Sick.hasMany(models.symptom, {foreignKey: 'sick_id', targetKey: 'sick_id'});
                    Sick.hasMany(models.treatment, {foreignKey: 'sick_id', targetKey: 'sick_id'});
                    Sick.hasMany(models.pond, {foreignKey: 'pond_id', targetKey: 'pond_id', as: 'Pond'});
                    Sick.hasMany(models.stocking, {foreignKey: 'stocking_id', targetKey: 'stocking_id', as: 'Stocking'});
                 }
             }
        }
    );
    return Sick;
};