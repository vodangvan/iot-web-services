'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('advice', 'advice_title',  {
          type: Sequelize.STRING(200),
          allowNull: true
      });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeColumn('advice', 'advice_title');
  }
};
