'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('stocking_pond', 'stockpond_age',  {
          type: Sequelize.INTEGER,
          allowNull: false
      }).then(()=> queryInterface.removeColumn('stocking', 'age_id'));
  },

  down: function (queryInterface, Sequelize) {
   return queryInterface.addColumn('stocking', 'age_id',
   {
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'age',
              key: 'age_id'
          }
      }).then(()=> queryInterface.removeColumn('stocking_pond', 'stockpond_age'));
  }
};
