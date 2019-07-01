"use strict";
module.exports = function(sequelize, DataTypes){
    var Symptom = sequelize.define("symptom",
        {
            symptom_id:{
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            sick_id:{
                type: DataTypes.INTEGER,
                allowNull: false,
                references:{
                    model: 'sick',
                    key: 'sick_id'
                },
                  validate:{
                      isInt: true
                }
            },      
            symptom_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            symptom_image: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            symptom_description: {
                type: DataTypes.STRING(1024),
                allowNull: true
            },
           
        },
        {
            tableName: "symptom",
            timestamps: false,
            freezeTableName: true,  
            classMethods: {
                associate: function(models) {
                    Symptom.belongsTo(models.sick,{ foreignKey: 'sick_id', targetKey: 'sick_id', as: 'Sick'});
                }
            }
        }
    );
    return Symptom;
};