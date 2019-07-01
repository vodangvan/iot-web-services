'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'user',
      'user_levelManager',
      {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    )
    queryInterface.addColumn(
      'user',
      'user_lockStatus',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    )
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('user','user_levelManager')
    .then(() =>queryInterface.removeColumn('user','user_lockStatus'))
  }
};
