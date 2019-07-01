'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.sequelize.query("ALTER TABLE `notification` CHANGE `user_id` `user_id` INT(11) NULL;")
      .then(()=>queryInterface.addColumn('notification', 'region_id',  {
          type: Sequelize.INTEGER,
          allowNull: true
      }));
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('notification', 'region_id');
  }
};
