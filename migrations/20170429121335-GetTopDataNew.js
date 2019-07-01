'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    var str = "CREATE PROCEDURE `GetTopDataNew`(IN `id` INT, IN `columnName` VARCHAR(65535), IN `arrDataTypeID` VARCHAR(65535), IN `typeStation` INT) ";
    str += " BEGIN";
    str += " SET @sql =  CONCAT('SELECT * FROM `data` WHERE ', columnName, ' = ', id,' AND `datatype_id` IN (', arrDataTypeID, ') AND `data_stationType` =  ',typeStation, ' HAVING `data_createdDate` = (SELECT MAX(d.`data_createdDate`) FROM `data` AS d WHERE d.`',columnName,'` = ',id,')');";
    str += " PREPARE stmt FROM @sql; EXECUTE stmt; ";
    str += " DEALLOCATE PREPARE stmt;";
    str += " END;";
    return queryInterface.sequelize.query(" DROP PROCEDURE IF EXISTS GetTopDataNew;")
    .then(()=>queryInterface.sequelize.query(str));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query(" DROP PROCEDURE IF EXISTS GetTopDataNew;");
  }
};
