"use strict";
module.exports = function(sequelize, DataTypes){
    var Agent = sequelize.define("agent", 
        {
            agent_id:{
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
            agent_name: {
                type: DataTypes.STRING(100),
                allowNull: false
            },
            agent_image: {
                type: DataTypes.STRING(100),
                allowNull: true
            },
            agent_description: {
                type: DataTypes.STRING(1024),
                allowNull: true
            },
        },
        {
            tableName: "agent",
            timestamps: false,
            freezeTableName: true,  
            classMethods: {
                associate: function(models) {
                    Agent.belongsTo(models.sick,{ foreignKey: 'sick_id', targetKey: 'sick_id', as: 'Sick'});
            
                }
            }
        }
    );
    return Agent;
};