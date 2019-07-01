"use strict";
module.exports = function(sequelize, DataTypes){
    var Treatment = sequelize.define("treatment",
        {
            treatment_id:{
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
            treatment_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            treatment_description: {
                type: DataTypes.STRING(1024),
                allowNull: true
            },
           
        },
        {
            tableName: "treatment",
            timestamps: false,
            freezeTableName: true,  
            classMethods: {
                associate: function(models) {
                    Treatment.belongsTo(models.sick,{ foreignKey: 'sick_id', targetKey: 'sick_id', as: 'Sick'});
                }
            }
        }
    );
    return Treatment;
};