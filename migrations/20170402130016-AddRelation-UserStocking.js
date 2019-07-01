'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.addColumn('stocking', 'user_id',  {
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'user',
              key: 'user_id'
          }
      });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('stocking', 'user_id')
  }
};
