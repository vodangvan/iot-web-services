'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("ALTER TABLE `station` ADD UNIQUE(`station_code`);");
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("ALTER TABLE `station` DROP INDEX `station_code`;");
  }
};
