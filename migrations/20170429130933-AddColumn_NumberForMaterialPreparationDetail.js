'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.addColumn('material_preparation_detail', 'matepredetail_number',  {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false
      }).then(()=>queryInterface.sequelize.query("ALTER TABLE `material_preparation_detail` DROP PRIMARY KEY, ADD PRIMARY KEY( `pondpreparation_id`, `material_id`, `matepredetail_number`);"));
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.sequelize.query("ALTER TABLE `material_preparation_detail` DROP PRIMARY KEY;")
      .then(queryInterface.removeColumn('material_preparation_detail', 'matepredetail_number'))
      .then(()=>queryInterface.sequelize.query("ALTER TABLE `material_preparation_detail` ADD PRIMARY KEY( `pondpreparation_id`, `material_id`);"));;
  }
};
