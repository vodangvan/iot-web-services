var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.block_notification.findAll({            
            attributes: ['user_id', 'station_id'],
            order: 'user_id ASC'
        }).then(function(data){                
           return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.block_notification.findAll({            
            attributes: ['user_id', 'station_id'],
            order: 'user_id ASC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(stationId, userId, done){
        model.block_notification.findOne({
            attributes: ['user_id', 'station_id'],
            where: {
                user_id : userId,
                station_id: stationId
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    GetListByUser: function(userId, done){
        model.block_notification.findAll({
            attributes: ['user_id', 'station_id'],
            where:{
                user_id: userId
            }
        }).then(function(data){
            return done(data);
        });
    },

    CheckBlockNotifi: function(userId, stationId){
        var deferred = Q.defer();
        model.block_notification.findOne({            
            attributes: ['user_id', 'station_id'],
            where:{
                user_id: userId,
                station_id: stationId
            }
        }).then(function(data){
            if(data){
                deferred.resolve(true);
            }else{
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    },

    GetListByStation: function(stationId, done){
        model.block_notification.findAll({
            attributes: ['user_id', 'station_id'],
            where:{
                station_id: stationId
            }
        }).then(function(data){
            return done(data);
        });
    },

    MapBlockNotification: function(body, done){        
        var dataNew = {
            user_id: body.user_id,
            station_id: body.station_id
        };
        model.block_notification.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.block_notification.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, stationId, userId, done){
         model.block_notification.destroy({
             where:{
                 user_id : userId,
                 station_id: stationId
            }
        }).then(function(data){
            return done(HttpStatus.OK, obj);
        }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}