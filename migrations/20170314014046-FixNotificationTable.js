'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.sequelize.query("ALTER TABLE `notification` DROP PRIMARY KEY, ADD PRIMARY KEY( `notif_id`);")
      .then(()=>queryInterface.sequelize.query("ALTER TABLE `notification` CHANGE `threshold_id` `threshold_id` INT(11) NULL;"))
      .then(()=>queryInterface.addColumn('notification', 'notif_type',  {
          type: Sequelize.INTEGER,
          allowNull: false
      }));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('notification', 'notif_type');
  }
};
