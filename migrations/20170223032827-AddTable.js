'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
     return queryInterface.createTable('location_manager', 
        {
          locaman_id: {
            type: Sequelize.INTEGER,            
            primaryKey: true,
            autoIncrement: true     
          },
          locaman_locationId:{
            type: Sequelize.STRING(5)
          },
          locaman_startDate:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.now
          },
          locaman_endDate:{
            type: Sequelize.DATE,
            defaultValue: Sequelize.now,
            allowNull: true
          },
          locaman_levelManager:{
            type: Sequelize.INTEGER,
            allowNull: false
          },
          user_id:{
            type: Sequelize.INTEGER,
            allowNull: false,
            references:{
                model: 'user',
                key: 'user_id'
            }
          }
        }
     ).then(()=> queryInterface.createTable('lock_history', 
        {
        lockhistory_id:{
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        lockhistory_lockDate:{
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.now
        },
        lockhistory_note:{
          type: Sequelize.STRING(500)
        },
        user_id:{
          type: Sequelize.INTEGER,
          allowNull: false,
          references:{
              model: 'user',
              key: 'user_id'
          }
        }
      }
     ))
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('location_manager')
      .then(queryInterface.dropTable('lock_history'));
  }
};
