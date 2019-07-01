var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require("q");
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.station_config.findAll({
            order: 'stationconfig_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.station_config.findAll({
            where: { stationconfig_value: {$like: '%'+ keyword + '%'}},
            order: 'stationconfig_value ASC'
        }).then(function(data){
            var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    //Trả về danh sách cấu hình của trạm chờ cập nhật
    GetListByStationID: function(stationID){
        var deferred = Q.defer();
        var strQuery = 'SELECT stc.* FROM `station_config` AS stc JOIN ';
        strQuery    += ' (SELECT `station_config`.`configtype_id`, `station_config`.`station_id`, MAX(`station_config`.`stationconfig_createDate`) as `maxDate` ';
        strQuery    += ' FROM `station_config` as `station_config` WHERE `station_config`.`station_id` = :stationID GROUP BY  `station_config`.`configtype_id`,  `station_config`.`station_id`) as sc ';
        strQuery    += ' ON stc.`configtype_id` = sc.`configtype_id` AND sc.`maxDate` = stc.`stationconfig_createDate` AND stc.`station_id` = sc.`station_id` ORDER BY stc.`stationconfig_id` ASC';       
        model.sequelize.query(strQuery,{ replacements: { stationID: stationID  }, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            deferred.resolve(data);
        });
        return deferred.promise;
    },

    GetById: function(id, done){
        model.station_config.findOne({where: {stationconfig_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByIdAndStatus: function(id, status, done){
        model.station_config.findOne({
            where: {
                stationconfig_id : id,
                stationconfig_status: status
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    GetByStationId: function(id, done){
        model.station_config.findAll({            
            where: { station_id: id},
            order: 'stationconfig_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByConfigTypeId: function(id, done){
        model.station_config.findAll({
            where: { configtype_id: id},
            order: 'stationconfig_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByStationAndStatus: function(stationId, status, done){
        model.station_config.findAll({
            where:{
                station_id: stationId,
                stationconfig_status: {
                    $eq: status
                }
            },
            order: 'stationconfig_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    UpdateStatus: function(stationId, statusOld, statusNew){
        var deferred = Q.defer();
        model.station_config.update({
            stationconfig_status: statusNew
        },{
            where:{
                station_id: stationId,
                stationconfig_status: statusOld
            }
        }).then(function(data){
            deferred.resolve(data);
        });
        return deferred.promise;
    },

    //Kiểm tra cấu hình tồn tại của 1 trạm
    CheckConfigExits: function(stationId, configTypeID, status){
        var deferred = Q.defer();
        model.station_config.findOne({
            where:{ 
                station_id: stationId,
                configtype_id: configTypeID,
                stationconfig_status: {
                    $eq: status
                }
            }
        }).then(function(data){
            if(data)
                deferred.resolve(true);
            else
                deferred.resolve(false);
        });
        return deferred.promise;
    },

    MapStationConfig: function(body, done){   
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        body.station_config.forEach(function(element) {
            var dataNew = {
                configtype_id: element.configtype_id,
                station_id: body.station_id,
                stationconfig_value: element.stationconfig_value,           
                stationconfig_createDate: body.stationconfig_createDate,
                stationconfig_status: body.stationconfig_status
            };
            model.station_config.build(dataNew).validate().then(function(error){
                if(error){
                    result.arrError.push(error);
                }                    
                else{
                    result.arrData.push(dataNew);
                }     
                result.lastRow +=1;
                if(result.lastRow == body.station_config.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        });     
    },

    //Nhận vào một mảng các station_config, thực hiện lưu vào CSDL
    AddMulti: function(arrDataNew, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        arrDataNew.forEach(function(dataElement){
            model.station_config.create(dataElement).then(function (data) {
                result.arrData.push(data);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            }).catch(function(error){
                result.arrError.push(error);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        });        
    },

    UpdateSert: function(arrDataNew, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        arrDataNew.forEach(function(element){
            model.station_config.findOne({
                where: {
                    configtype_id: element.configtype_id,
                    station_id: element.station_id,
                    stationconfig_status: 1
                }
            }).then(function(dataConfig){
                if(dataConfig){
                    dataConfig.stationconfig_value = element.stationconfig_value;
                    dataConfig.stationconfig_createDate = element.stationconfig_createDate;
                    model.station_config.update(dataConfig.dataValues,{
                        where: {stationconfig_id: dataConfig.dataValues.stationconfig_id}
                    }).then(function(data){
                        result.arrData.push(dataConfig.dataValues);
                         result.lastRow += 1;
                        if(result.lastRow == arrDataNew.length){
                            if(result.arrError.length > 0){
                                return done(HttpStatus.BAD_REQUEST, result.arrError);
                            }else{
                                return done(HttpStatus.OK, result.arrData);
                            }
                        }
                    }).catch(function(error){
                        result.arrError.push(error);
                         result.lastRow += 1;
                        if(result.lastRow == arrDataNew.length){
                            if(result.arrError.length > 0){
                                return done(HttpStatus.BAD_REQUEST, result.arrError);
                            }else{
                                return done(HttpStatus.OK, result.arrData);
                            }
                        }
                    });
                   
                }else{
                    model.station_config.create(element).then(function(data){
                        result.arrData.push(data);
                        result.lastRow += 1;
                        if(result.lastRow == arrDataNew.length){
                            if(result.arrError.length > 0){
                                return done(HttpStatus.BAD_REQUEST, result.arrError);
                            }else{
                                return done(HttpStatus.OK, result.arrData);
                            }
                        }
                    }).catch(function(error){
                        result.arrError.push(error);
                        result.lastRow += 1;
                        if(result.lastRow == arrDataNew.length){
                            if(result.arrError.length > 0){
                                return done(HttpStatus.BAD_REQUEST, result.arrError);
                            }else{
                                return done(HttpStatus.OK, result.arrData);
                            }
                        }
                    });
                }
            })
        });  
    },
    Delete: function(obj, id, done){
         model.station_config.destroy({where:{stationconfig_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    DeleteMulti: function(stationId, status, done){
        model.station_config.destroy({
            where:{
                station_id: stationId,
                stationconfig_status: status
            }
        }).then(function(data){
            return done(HttpStatus.OK, stationId)
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}