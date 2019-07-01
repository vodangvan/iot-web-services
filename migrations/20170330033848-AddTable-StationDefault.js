'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable("station_default", {
          user_id:{
              type: Sequelize.INTEGER,            
              references:{
                  model: 'user',
                  key: 'user_id'
              },
              primaryKey: true,
              allowNull: false
          },
          station_id:{
              type: Sequelize.INTEGER,
              references:{
                  model: 'station',
                  key: 'station_id'
              },
              primaryKey: true,
              allowNull: false
          }
      })
  },

  down: function (queryInterface, Sequelize) {    
      return queryInterface.dropTable('station_default');    
  }
};
