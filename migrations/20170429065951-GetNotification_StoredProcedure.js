'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    var str = "";
    str += ' CREATE PROCEDURE `GetNotificationByRegion`(IN userID INT, IN arrayRegionID VARCHAR(65535), IN indexOffset INT, IN sizeLimit INT)';
    str += ' BEGIN';
    str += " SET @sql =  CONCAT('SELECT notif.*, (CASE WHEN `notif_state`.`notifstate_readTime` IS NULL THEN 0 ELSE 1 END) as notif_readState ";
    str += " FROM `notification` AS notif  LEFT JOIN `notification_state` AS `notif_state` ON notif.`notif_id` = notif_state.`notif_id` AND notif_state.`user_id` = ', userID ,' WHERE notif.`region_id` IN (', arrayRegionID ,') ORDER BY notif.`notif_id` DESC LIMIT ',indexOffset,', ', sizeLimit ,';');";
    str += ' PREPARE stmt FROM @sql; EXECUTE stmt;  DEALLOCATE PREPARE stmt; ';
    str += ' END;';

    var str2 = 'CREATE PROCEDURE GetNotificationByUser(IN userID INT, IN arrayRegionID VARCHAR(65535), IN indexOffset INT, IN sizeLimit INT, IN typeGet INT)';
    str2 += ' BEGIN';
    str2 += " SET @sql = CONCAT('IF (',typeGet,' = 1) THEN SELECT DISTINCT notif.*, (CASE WHEN notif_state.`notifstate_readTime` IS NULL THEN 0 ELSE 1 END) as notif_readState  FROM `notification` AS notif LEFT JOIN `notification_state` AS notif_state ON notif.`notif_id` = notif_state.`notif_id` AND notif_state.`user_id` = ',userID,' WHERE (notif.`user_id` = ',userID,' OR (notif.`user_id` IS NULL AND notif.`region_id` IN ( ',arrayRegionID,' ))) ORDER BY notif.`notif_id` DESC LIMIT ',indexOffset,',', sizeLimit ,'; ELSE SELECT DISTINCT notif.*, (CASE WHEN notif_state.`notifstate_readTime` IS NULL THEN 0 ELSE 1 END) as notif_readState FROM `notification` AS notif LEFT JOIN `notification_state` AS notif_state ON notif.`notif_id` = notif_state.`notif_id` AND notif_state.`user_id` = ',userID,' WHERE notif.`user_id` = ',userID,' ORDER BY notif.`notif_id` DESC LIMIT ',indexOffset,',', sizeLimit ,'; END IF;');";
    str2 += " PREPARE stmt FROM @sql; EXECUTE stmt;  DEALLOCATE PREPARE stmt; "
    str2 += ' END;'
    return queryInterface.sequelize.query("DROP PROCEDURE IF EXISTS `GetNotificationByRegion`;")
    .then(()=>queryInterface.sequelize.query("DROP PROCEDURE IF EXISTS `GetNotificationByUser`;"))
    .then(()=>queryInterface.sequelize.query(str))
    .then(()=>queryInterface.sequelize.query(str2));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("DROP PROCEDURE IF EXISTS GetNotificationByRegion;")
    .then(()=>queryInterface.sequelize.query("DROP PROCEDURE IF EXISTS `GetNotificationByUser`;"));
  }
};
