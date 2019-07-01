'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
   
      queryInterface.removeColumn('stocking', 'pond_id');
      return queryInterface.addColumn('stocking', 'stockingtype_id',  {
          type: Sequelize.INTEGER,
          allowNull: true
      }).then(()=>queryInterface.sequelize.query("ALTER TABLE stocking ADD CONSTRAINT stocking_stockingtype_id_fkey FOREIGN KEY(stockingtype_id) REFERENCES stocking_type(stockingtype_id) MATCH SIMPLE ON UPDATE CASCADE ON DELETE CASCADE;"))  
    },

  down: function (queryInterface, Sequelize) { 
    queryInterface.addColumn('stocking',
        'pond_id',
        {
          type: Sequelize.INTEGER,
              allowNull: false,
              references:{
                  model: 'pond',
                  key: 'pond_id'
              }
        }
      );
      return queryInterface.removeColumn('stocking', 'stockingtype_id');
  }
};
