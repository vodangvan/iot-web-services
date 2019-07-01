'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.addColumn('station', 'station_duration',  {
          type: Sequelize.FLOAT,
          defaultValues: 30
      })
      .then(()=>queryInterface.addColumn('station', 'station_updateStatus',  {
          type: Sequelize.BOOLEAN,
          allowNull: true
      }))
      .then(()=>queryInterface.createTable("config_type", {
          configtype_id:{
              type: Sequelize.INTEGER,            
              primaryKey: true,
              autoIncrement: true        
          },
          configtype_name:{
              type:  Sequelize.STRING(255),
              allowNull: false
          },
          configtype_cmdKeyword:{
              type:  Sequelize.STRING(255),
              allowNull: false
          },
          configtype_variable:{
              type: Sequelize.STRING(255),
              allowNull: true
          }
      }))
      .then(()=>queryInterface.createTable("station_config", {
          stationconfig_id:{
              type: Sequelize.INTEGER,            
              primaryKey: true,
              autoIncrement: true        
          },
          configtype_id:{
              type: Sequelize.INTEGER,
              allowNull: false,
              references:{
                  model: 'config_type',
                  key: 'configtype_id'
              }
          },
          station_id:{
              type: Sequelize.INTEGER,
              allowNull: false,
              references:{
                  model: 'station',
                  key: 'station_id'
              }
          },
          stationconfig_value:{
              type:  Sequelize.STRING(255),
              allowNull: false
          },
          stationconfig_status:{
              type:  Sequelize.BOOLEAN,
              allowNull: true
          },
          stationconfig_createDate:{
              type: Sequelize.DATE,
              allowNull: false,
              defaultValues: Sequelize.NOW
          }
      }))
      .then(()=>queryInterface.createTable("block_notification", {
          user_id:{
              type: Sequelize.INTEGER,            
              references:{
                  model: 'user',
                  key: 'user_id'
              },
              primaryKey: true,
              allowNull: false
          },
          station_id:{
              type: Sequelize.INTEGER,
              references:{
                  model: 'station',
                  key: 'station_id'
              },
              primaryKey: true,
              allowNull: false
          }
      }))
      .then(()=>queryInterface.sequelize.query("ALTER TABLE `threshold` CHANGE `region_id` `region_id` INT(11) NULL;"))
      .then(()=>queryInterface.sequelize.query("ALTER TABLE `threshold` CHANGE `age_id` `age_id` INT(11) NULL;"))
      .then(()=>queryInterface.sequelize.query("ALTER TABLE `threshold` CHANGE `species_id` `species_id` INT(11) NULL;"))
      .then(()=>queryInterface.addColumn('threshold', 'threshold_type',  {
          type: Sequelize.BOOLEAN,
          allowNull: true
      }));
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.removeColumn('station', 'station_duration')
      .then(()=>queryInterface.removeColumn('station', 'station_updateStatus'))
      .then(()=>queryInterface.dropTable('block_notification'))
      .then(()=>queryInterface.dropTable('station_config'))
      .then(()=>queryInterface.dropTable('config_type'))
      .then(()=>queryInterface.removeColumn('threshold', 'threshold_type'));
  }
};
