'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addColumn('data_type', 'datatype_minValue',  {
          type: Sequelize.FLOAT,
          allowNull: true
      }).then(()=>queryInterface.addColumn('data_type', 'datatype_maxValue',  {
          type: Sequelize.FLOAT,
          allowNull: true
      }));
  },

  down: function (queryInterface, Sequelize) {
   return queryInterface.removeColumn('data_type', 'datatype_minValue').then(()=>queryInterface.removeColumn('data_type', 'datatype_maxValue'));
  }
};
