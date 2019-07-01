var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require("q");
module.exports = {
    
    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.notification.findAll({
            where: { notif_title: {$like: '%'+ keyword + '%'}},
            order: 'notif_id DESC'
        }).then(function(data){
            var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },
 
    GetNotificationByLogin: function(userid, arrRegionId, userLevel){        
        var deferred = Q.defer();
        var strQuery = 'SELECT COUNT(*) AS notif_totalRow ';
        strQuery    += 'FROM `notification` AS notif LEFT JOIN `notification_state` AS notif_state ON notif.`notif_id` = notif_state.`notif_id` AND notif_state.`user_id` = :userId ';
        if(arrRegionId.length > 0)
        {
            if(userLevel == 0){
                strQuery    += ' WHERE (notif.`user_id` = :userId OR (notif.`region_id` IN ('+ arrRegionId.toString() +') AND notif.`user_id` IS NULL)) AND notif_state.`notifstate_readTime` IS NULL';
            }else{
                strQuery    += ' WHERE (notif.`user_id` = :userId OR notif.`region_id` IN ('+ arrRegionId.toString() +')) AND notif_state.`notifstate_readTime` IS NULL';
            }
        }
        else
            strQuery    += ' WHERE notif.`user_id` = :userId AND notif_state.`notifstate_readTime` IS NULL';
        model.sequelize.query(strQuery,{ replacements: { userId: userid}, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    },

    GetById: function(id, done){
        model.notification.findOne({
            where: {notif_id : id}
        })
        .then(function(data){                
            return done(data);
        });  
    },

    GetByDataId: function(dataId){
        var deferred = Q.defer();
        model.notification.findOne({
            where:{
                data_id: dataId
            }
        }).then(function(notifi){
            if(notifi){
                deferred.resolve(notifi);
            }else{
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    },

    GetByUserId: function(userId, arrRegionId, index, size = 10, done){
        var arrID = [];
        if(arrRegionId.length > 0){
            arrRegionId.forEach(function(item){
                arrID.push(item.dataValues.region_id);
                if(arrID.length == arrRegionId.length){
                    // var strQuery = 'SELECT DISTINCT notif.*, (CASE WHEN notif_state.`notifstate_readTime` IS NULL THEN 0 ELSE 1 END) as notif_readState ';
                    // strQuery    += 'FROM `notification` AS notif LEFT JOIN `notification_state` AS notif_state ON notif.`notif_id` = notif_state.`notif_id` AND notif_state.`user_id` = :userId ';
                    // strQuery    += ' WHERE (notif.`user_id` = :userId OR (notif.`user_id` IS NULL AND notif.`region_id` IN ('+ arrID.toString() +'))) ORDER BY notif.`notif_id` DESC LIMIT :index, :size';
                    var strQuery = " CALL GetNotificationByUser(:userId, :arrRegionId, :index, :size, :typeGet);"
                    model.sequelize.query(strQuery,{ replacements: { userId: userId, arrRegionId: arrID.toString(), index: parseInt(index * size), size: parseInt(size), typeGet: 1  }, type: model.sequelize.QueryTypes.SELECT })
                    .then(function(data) {
                        var array = Object.keys(data[0]).map(function (key) { return data[0][key]; });
                        return done(array);
                    });
                }
            });   
        }else{
            // var strQuery = 'SELECT DISTINCT notif.*, (CASE WHEN notif_state.`notifstate_readTime` IS NULL THEN 0 ELSE 1 END) as notif_readState ';
            // strQuery    += 'FROM `notification` AS notif LEFT JOIN `notification_state` AS notif_state ON notif.`notif_id` = notif_state.`notif_id` AND notif_state.`user_id` = :userId ';
            // strQuery    += ' WHERE notif.`user_id` = :userId ORDER BY notif.`notif_id` DESC LIMIT :index, :size';
            var strQuery = " CALL GetNotificationByUser(:userId, :arrRegionId, :index, :size, :typeGet);"
            model.sequelize.query(strQuery,{ replacements: { userId: userId, arrRegionId: '', index: parseInt(index * size), size: parseInt(size), typeGet: 0  }, type: model.sequelize.QueryTypes.SELECT })
            .then(function(data) {
                var array = Object.keys(data[0]).map(function (key) { return data[0][key]; });
                return done(array);
            });
        }            
    },

    GetByRegionId: function(userId, arrRegionId, index, size = 10, done){
        // var strQuery = 'SELECT notif.*, (CASE WHEN `notif_state`.`notifstate_readTime` IS NULL THEN 0 ELSE 1 END) as notif_readState ';
        // strQuery    += 'FROM `notification` AS notif  LEFT JOIN `notification_state` AS `notif_state` ON notif.`notif_id` = notif_state.`notif_id` AND notif_state.`user_id` =:userId ';
        // strQuery    += ' WHERE notif.`region_id` IN ('+ arrRegionId.toString() +') ORDER BY notif.`notif_id` DESC LIMIT :index, :size';
        var strQuery = " CALL GetNotificationByRegion(:userId, :arrRegionId, :index, :size);"
        model.sequelize.query(strQuery,{ replacements: { userId: userId, arrRegionId: arrRegionId.toString(), index: parseInt(index * size), size: parseInt(size) }, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            var array = Object.keys(data[0]).map(function (key) { return data[0][key]; });
            return done(array);
        });
    },

    //Kiểm tra dữ liệu có trùng lập hay không
    CheckDuplicatedNotifi: function(threshold_id, user_id, datatype_id, timeWarning){
        var deferred = Q.defer();
        model.notification.findOne({include: [{model: model.data, as: 'Data'}], where: {
                threshold_id: threshold_id,
                user_id: user_id,
                notif_createdDate: {
                    $gte: timeWarning
                }
            }
        }).then(function(data){
            if(data && data.Data.datatype_id == datatype_id) {
                deferred.resolve(true);
            }
            else {
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    },

    CheckDuplicatedNotifi2: function(threshold_id, userId, regionId, datatype_id, timeWarning){
        var deferred = Q.defer();
        model.notification.findOne({include: [{model: model.data, as: 'Data'}], where: {
                threshold_id: threshold_id,
                $or:[
                    {
                        user_id:{
                            $eq: userId,
                            $ne: null
                        }
                    },
                    {
                        region_id:{
                            $eq: regionId,
                            $ne: null
                        }
                    }
                ],
                notif_createdDate: {
                    $gte: timeWarning
                }
            }
        }).then(function(data){
            if(data && data.Data.datatype_id == datatype_id) {
                deferred.resolve(true);
            }
            else {
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    },

    GetNotifiSendSms: function(notif_id){
        var deferred = Q.defer();
        var strQuery = 'SELECT nt.`notif_title`, p.`pond_description`, dt.`datatype_name`, d.`data_value`, ad.`advice_title`, ad.`advice_message` ';
        strQuery    += 'FROM `notification` AS nt JOIN `data` AS d ON nt.`data_id` = d.`data_id` JOIN `pond` AS p ON p.`pond_id` = d.`pond_id` JOIN `data_type` AS dt ON d.`datatype_id` = dt.`datatype_id` JOIN `advice` AS ad ON nt.`threshold_id` = ad.`threshold_id` AND ad.`advice_createdDate` = (SELECT MAX(adv.`advice_createdDate`) FROM `advice` AS adv WHERE adv.`user_id` = ad.`user_id` AND adv.`threshold_id` = ad.`threshold_id`) '
        strQuery    += ' WHERE nt.`notif_id` = :notif_id';
        model.sequelize.query(strQuery,{ replacements: { notif_id: notif_id  }, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    },

    MapNotification: function(body){      
        var deferred = Q.defer();
        var dataNew = {
            threshold_id: body.threshold_id,
            data_id: body.data_id,
            user_id: body.user_id,
            region_id: body.region_id,
            notif_title: body.notif_title,            
           // notif_readState: body.notif_readState || 0,
            notif_createdDate: body.notif_createdDate,
            notif_type: body.notif_type
        };
        model.notification.build(dataNew).validate().then(function(error){
            if(error)
            {
                var obj = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: error
                };
                deferred.resolve(obj);
            }               
            else{   
                var obj = {
                    statusCode: HttpStatus.OK,
                    data: dataNew
                };             
                deferred.resolve(obj);
            }     
        });
        return deferred.promise;
    },

    Add: function(dataNew, done){
        model.notification.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    AddMulti: function(dataArray, done){
        var result={
            rowAff: 0,
            data: []
        };
        dataArray.forEach(function(dataNew){
            model.notification.create(dataNew).then(function (data) {
                result.rowAff +=1;
                result.data.push(data);
                if(result.rowAff == dataArray.length)
                    return done(HttpStatus.CREATED, result.data);        
            }).catch(function(error){
                if(error)
                    return done(HttpStatus.BAD_REQUEST, error);
            });
        });
    },

    Update: function(dataNew, id, done){
        model.notification.update(dataNew,{
                where: {notif_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    /*UpdateState: function(state, id, done){
        model.notification.update({notif_readState: state},{
                where: {notif_id: id}
            }).then(function(error){
                if(error != true)
                    return done(HttpStatus.BAD_REQUEST, error);
                else
                    return done(HttpStatus.OK, state);
            }).catch(function(error){
                if(error)
                    return done(HttpStatus.BAD_REQUEST, error);
        });
    },*/

    Delete: function(obj, id, done){
         model.notification.destroy({where:{notif_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}