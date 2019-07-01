'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("ALTER TABLE `station` CHANGE `station_duration` `station_duration` BIGINT NULL  DEFAULT '10';")
      .then(()=>queryInterface.addColumn('config_type', 'configtype_parentId',  {
          type: Sequelize.INTEGER,
          allowNull: true,
          references:{
              model: 'config_type',
              key: 'configtype_id'
          }
      }))
      .then(()=>queryInterface.addColumn('config_type', 'configtype_order',  {
          type: Sequelize.INTEGER
      }))
      .then(()=>queryInterface.addColumn('config_type', 'configtype_default',  {
          type: Sequelize.STRING(255),
          allowNull: true
      }))
      .then(()=>queryInterface.addColumn('config_type', 'configtype_discription',  {
          type: Sequelize.STRING(500),
          allowNull: true
      }))
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('config_type', 'configtype_parentId')
    .then(()=>queryInterface.removeColumn('config_type', 'configtype_order'))
    .then(()=>queryInterface.removeColumn('config_type', 'configtype_default'))
    .then(()=>queryInterface.removeColumn('config_type', 'configtype_discription'));
  }
};
