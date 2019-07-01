var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require("q");
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.sensor.findAll({
            order: 'sensor_name ASC'
        }).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.sensor.findAll({
            include: [
                {model: model.station, attributes: ['station_name'], as: 'Station'},
                {model: model.data_type, attributes: ['datatype_name'], as: 'Data_Type'}
            ],
            where: { sensor_name: {$like: '%'+ keyword + '%'}},
            order: 'sensor_name ASC'
    }).then(function(data){
        var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.sensor.findOne({where: {sensor_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByStationId: function(id, done){
        model.sensor.findAll({            
            where: { station_id: id},
            order: 'sensor_name ASC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByDataTypeId: function(id, done){
        model.sensor.findAll({
            where: { datatype_id: id},
            order: 'sensor_name ASC'
        }).then(function(data){
            return done(data);
        });
    },

    GetBySerialNumber: function(serial, done){
        model.sensor.findOne({
            where: { sensor_serialNumber: serial},
        }).then(function(data){
            return done(data);
        });
    },

    CheckSensorOfStation: function(sensorId, stationId, dataTypeId, done){
        if(sensorId == null){
            model.sensor.findOne({
                where: {
                    station_id: stationId,
                    datatype_id: dataTypeId
                }
            }).then(function(data){
                if(data){
                    return done(true);
                }else{
                    return done(false);
                }
            });
        }else{
            model.sensor.findOne({
                where: {
                    sensor_id: {
                        $ne: sensorId
                    },
                    station_id: stationId,
                    datatype_id: dataTypeId
                }
            }).then(function(data){
                if(data){
                    return done(true);
                }else{
                    return done(false);
                }
            });
        }        
    },

    //Kiểm tra số serial có tồn tại chưa.
    CheckSerial: function(code){
        var deferred = Q.defer();
        model.sensor.findOne({where:{ sensor_serialNumber: code}}).then(function(data){                
            if(data)
                deferred.resolve(true);
            else
                deferred.resolve(false);
        });
        return deferred.promise;
    },

    MapSensor: function(body, done){        
        var dataNew = {
           datatype_id: body.datatype_id,
           station_id: body.station_id,
           sensor_name: body.sensor_name,
           sensor_serialNumber: body.sensor_serialNumber || null
        };
        model.sensor.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.sensor.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.sensor_id = id;
        model.sensor.update(dataNew,{
                where: {sensor_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.sensor.destroy({where:{sensor_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}