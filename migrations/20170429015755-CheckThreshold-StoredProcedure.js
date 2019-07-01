'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    var str = "";
    str += " CREATE PROCEDURE CheckThresholdData(IN dataID INT(11), IN thresholdType INT(11))";
    str += " BEGIN";
    str += " IF (thresholdType = 1) THEN";
    str += ' SELECT p.`user_id`, us.`user_phone`, us.`user_sendSms`, th.*, sta.`station_id` ';
    str += ' FROM `data` as d JOIN `pond` AS p ON d.`pond_id` = p.`pond_id` JOIN `user` AS us ON p.`user_id` = us.`user_id` JOIN `stocking_pond` AS stp ON d.`pond_id` = stp.`pond_id` JOIN `stocking` AS st ON st.`stocking_id` = stp.`stocking_id` AND  d.`data_createdDate` > stp.`stockpond_date` AND st.`stocking_status` = 1 JOIN `age` AS ag ON CURDATE() BETWEEN DATE_ADD(stp.`stockpond_date`, INTERVAL ( ag.`age_valueMin` + stp.`stockpond_age`) DAY) AND DATE_ADD(stp.`stockpond_date`, INTERVAL ( ag.`age_valueMax` + stp.`stockpond_age`) DAY) JOIN `species` AS sp ON st.`species_id` = sp.`species_id` JOIN `station` as sta ON d.`station_id` = sta.`station_id` JOIN `threshold` AS th ON th.`datatype_id` = d.`datatype_id` AND th.`age_id` = ag.`age_id` AND th.`region_id` = sta.`region_id` AND th.`species_id` = sp.`species_id` AND d.`data_value` BETWEEN th.`threshold_start` AND th.`threshold_end` AND th.`threshold_level` >0 AND th.`threshold_type` = 1 ';
    str += ' WHERE d.`data_id` = dataID  GROUP BY th.`threshold_id`;';
    str += ' ELSE';
    str += ' SELECT th.*, sta.`station_id`';
    str += ' FROM `data` AS d JOIN `station` AS sta ON d.`station_id` = sta.`station_id` JOIN `threshold` AS th ON th.`datatype_id` = d.`datatype_id` AND th.`region_id` = sta.`region_id` AND d.`data_value` BETWEEN th.`threshold_start` AND th.`threshold_end` AND th.`threshold_level` > 0 AND th.`threshold_type` = 0 ';
    str += ' WHERE d.`data_id` = dataID GROUP BY th.`threshold_id`;';
    str += ' END IF;';
    str += ' END;';
    return queryInterface.sequelize.query("DROP PROCEDURE IF EXISTS CheckThresholdData;")
    .then(()=>queryInterface.sequelize.query(str));
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.sequelize.query("DROP PROCEDURE IF EXISTS CheckThresholdData;");
  }
};
