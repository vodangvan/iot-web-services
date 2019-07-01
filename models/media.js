"use strict";
module.exports = function(sequelize, DataTypes) {
  var Media = sequelize.define("media", {
    media_id:{
        type: DataTypes.INTEGER,            
        primaryKey: true,
        autoIncrement: true        
    },
    post_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references:{
            model: 'post',
            key: 'post_id'
        },
        validate:{
            isInt: true
        }
    },
    media_tittle:{
        type: DataTypes.STRING(500),
        allowNull: true
    },
    media_link:{
        type: DataTypes.STRING(500),
        allowNull: false
    },
    media_type:{
        type: DataTypes.BOOLEAN,
        allowNull: true
    }
  }, 
  {
     tableName: "media",
     timestamps: false,
     freezeTableName: false,
     classMethods: {
        associate: function(models) {           
            Media.belongsTo(models.post, { foreignKey: 'post_id', targetKey: 'post_id', as: 'Post'});
      }
    }
  });
  return Media;
};