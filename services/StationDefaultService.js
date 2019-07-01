var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.station_default.findAll({
            order: 'user_id ASC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(stationId, userId, done){
        model.station_default.findOne({
            where: {
                user_id : userId,
                station_id: stationId
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    GetByUser: function(userId, done){
        model.station_default.findOne({
            where:{
                user_id: userId
            }
        }).then(function(data){
            return done(data);
        });
    },

    GetListByStation: function(stationId, done){
        model.station_default.findAll({
            where:{
                station_id: stationId
            }
        }).then(function(data){
            return done(data);
        });
    },

    MapStationDefault: function(body, done){        
        var dataNew = {
            user_id: body.user_id,
            station_id: body.station_id
        };
        model.station_default.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.station_default.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, userId, done){
        model.station_default.update(dataNew,{
                where: {user_id: userId}
            }).then(function(error){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
            });
    },

    Delete: function(obj, userId, done){
         model.station_default.destroy({
             where:{
                 user_id : userId
            }
        }).then(function(data){
            return done(HttpStatus.OK, obj);
        }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}