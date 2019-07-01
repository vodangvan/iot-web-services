'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable("notification_state", {
        user_id:{
            type: Sequelize.INTEGER,            
            references:{
                model: 'user',
                key: 'user_id'
            },
            primaryKey: true,
            allowNull: false
        },
        notif_id:{
            type: Sequelize.BIGINT.UNSIGNED,
            references:{
                model: 'notification',
                key: 'notif_id'
            },
            primaryKey: true,
            allowNull: false
        },
        notifstate_readTime:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValues: Sequelize.NOW
        }
    }).then(()=>queryInterface.removeColumn('notification', 'notif_readState'))
  },

  down: function (queryInterface, Sequelize) {    
      return queryInterface.dropTable('notification_state')
      .then(()=>queryInterface.addColumn('notification', 'notif_readState',  {
            type: Sequelize.BOOLEAN,
            allowNull: false
      }));
  }
};
