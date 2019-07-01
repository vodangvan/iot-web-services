var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require("q");
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done) {
        model.data.findAll({ order: 'data_createdDate DESC' }).then(function(data) {
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done) {
        model.data.findAll({
            // include: [{ all: true }], 
            where: { data_id: { $like: '%' + keyword + '%' } },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            var dataList = {};
            dataList = data.slice(parseInt(page) * parseInt(pageSize), parseInt(page) * parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);
        });
    },

    GetById: function(id, done) {
        model.data.findOne({ where: { data_id: id } }).then(function(data) {
            return done(data);
        });
    },

    GetBySinkId: function(id, dateStart, dateEnd, done) {
        model.data.findAll({
            //include: [{ all: true }], 
            where: {
                sink_id: id,
                data_createdDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                }
            },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            return done(data);
        });
    },

    //Lấy về danh sách dữ liệu trong 1 khoảng thời gian theo mã trạm
    //Dữ liệu nhận vào là id của trạm (station), thời gian bắt đầu, kết thúc của khoảng thời gian lấy dữ liệu
    //Trả về danh sách dữ liệu
    GetByStationId: function(id, dateStart, dateEnd, done) {
        model.data.findAll({
            // include: [{ all: true }], 
            where: {
                station_id: id,
                data_createdDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                }
            },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            return done(data);
        });
    },

    //Lấy về dữ liệu mới nhất theo id của trạm, ao hoặc sông
    //Với các thông tin truyền vào là mảng các loại dữ liệu arrDataType
    //Tên của loại truy xuất: station_id, pond_id, river_id
    //Loại dữ liệu lấy về của trạm cầm tay (typeStation = 0) hay trạm cố định (typeStation = 1)
    GetTopDataNew: function(id, arrDataType, nameID, typeStation = 1) {
        var deferred = Q.defer();
        var strQuery = "";
        //var itemIndex = 0;
        var arr = [];
        arrDataType.forEach(function(item) {
            // strQuery += "(SELECT * FROM `data` WHERE `"+ nameID.toString() +"` = :id AND `datatype_id` = "+ item +" AND `data_stationType` = :typeStation ORDER BY `data_createdDate` DESC LIMIT 1) ";
            // if(itemIndex < arrDataType.length-1){
            //     strQuery += " UNION ";
            //     itemIndex += 1;
            // }else{
            // model.sequelize.query(strQuery,{ replacements: { id: id, typeStation: typeStation }, type: model.sequelize.QueryTypes.SELECT })
            // .then(function(data) {
            //     deferred.resolve(data);
            // });                
            // }
            arr.push(item);
            if (arr.length == arrDataType.length) {
                strQuery += "CALL GetTopDataNew(:id, :nameID, :arrDataType, :typeStation);";
                model.sequelize.query(strQuery, { replacements: { id: id, nameID: nameID.toString(), arrDataType: arr.toString(), typeStation: typeStation }, type: model.sequelize.QueryTypes.SELECT })
                    .then(function(data) {
                        var array = Object.keys(data[0]).map(function(key) { return data[0][key]; });
                        deferred.resolve(array);
                    });
            }
        });
        return deferred.promise;
    },

    GetByDataTypeId: function(id, dateStart, dateEnd, done) {
        model.data.findAll({
            where: {
                datatype_id: id,
                data_createdDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                }
            },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            return done(data);
        });
    },

    GetByPondId: function(id, dateStart, dateEnd, done) {
        model.data.findAll({
            where: {
                pond_id: id,
                data_createdDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                }
            },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            return done(data);
        });
    },

    GetByPondIdDynamic: function(id, dateStart, dateEnd, done) {
        model.data.findAll({
            where: {
                pond_id: id,
                data_createdDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                },
                data_stationType: 0
            },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            return done(data);
        });
    },

    GetByRiverId: function(id, dateStart, dateEnd, done) {
        model.data.findAll({
            where: {
                river_id: id,
                data_createdDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                }
            },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            return done(data);
        });
    },

    GetByRiverIdDynamic: function(id, dateStart, dateEnd, done) {
        model.data.findAll({
            where: {
                river_id: id,
                data_createdDate: {
                    $gte: dateStart,
                    $lte: dateEnd
                },
                data_stationType: 0
            },
            order: 'data_createdDate DESC'
        }).then(function(data) {
            return done(data);
        });
    },

    GetSinkAndStationID: function(sink_code, station_code) {
        var deferred = Q.defer();
        model.sink.findOne({
            include: [{
                model: model.station,
                where: { station_code: station_code },
                limit: 1
            }],
            where: {
                sink_code: sink_code
            }
        }).then(function(data) {
            if (data && data.stations.length > 0) {
                var obj = {
                    sink_id: data.sink_id,
                    station_id: data.stations[0].station_id,
                    pond_id: data.stations[0].pond_id,
                    river_id: data.stations[0].river_id,
                    station_name: data.stations[0].station_name
                }
                deferred.resolve(obj);
                //
            } else {
                var obj = {
                    sink_id: 0,
                    station_id: 0,
                    pond_id: null,
                    river_id: null,
                    station_name: null
                }
                deferred.resolve(obj);
            }
        });
        return deferred.promise;
    },

    GetUserOrRegion: function(pondId, riveId) {
        var deferred = Q.defer();
        var dataResult = {
            user_id: null,
            user_sendSms: null,
            user_phone: null,
            region_id: null
        };
        if (pondId != null && pondId != undefined) {
            model.pond.findOne({
                where: {
                    pond_id: pondId
                }
            }).then(function(pondData) {
                dataResult.region_id = pondData.region_id;
                if (pondData.user_id) {
                    model.user.findOne({
                        where: {
                            user_id: pondData.user_id
                        }
                    }).then(function(userData) {
                        dataResult.user_id = userData.user_id;
                        dataResult.user_sendSms = userData.user_sendSms;
                        dataResult.user_phone = userData.user_phone;
                        deferred.resolve(dataResult);
                    });
                } else {
                    deferred.resolve(null);
                }
            });
        } else if (riveId != null && riveId != undefined) {
            model.river.findOne({
                where: {
                    river_id: riveId
                }
            }).then(function(riverData) {
                if (riverData.region_id) {
                    model.region.findOne({
                        where: {
                            region_id: riverData.region_id
                        }
                    }).then(function(regionData) {
                        dataResult.region_id = regionData.region_id;
                        deferred.resolve(dataResult)
                    });
                } else {
                    deferred.resolve(null);
                }
            })
        } else {
            deferred.resolve(null);
        }
        return deferred.promise;
    },

    //Kiểm tra dữ liệu có trùng lập hay không
    CheckDuplicatedData: function(pond_id, river_id, sink_id, station_id, datatype_id, data_createdDate) {
        var deferred = Q.defer();
        model.data.findOne({
            where: {
                pond_id: pond_id,
                river_id: river_id,
                sink_id: sink_id,
                station_id: station_id,
                datatype_id: datatype_id,
                data_createdDate: data_createdDate
            }
        }).then(function(data) {
            if (data) {
                deferred.resolve(true);
            } else {
                deferred.resolve(false);
            }
        });
        return deferred.promise;
    },

    MapData: function(body) {
        var deferred = Q.defer();
        var dataNew = {
            station_id: body.station_id,
            datatype_id: body.datatype_id,
            sink_id: body.sink_id || null,
            pond_id: body.pond_id || null,
            river_id: body.river_id || null,
            data_value: body.data_value,
            data_createdDate: body.data_createdDate,
            data_stationType: body.data_stationType,
        };
        model.data.build(dataNew).validate().then(function(error) {
            if (error) {
                var obj = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: error
                };
                deferred.resolve(obj);
            } else {
                var obj = {
                    statusCode: HttpStatus.OK,
                    data: dataNew
                };
                deferred.resolve(obj);
            }
        });
        return deferred.promise;
    },

    //thresholdType: 0: trạm sông, 1: trạm ao, null khác
    CheckThresholdData: function(dataID, thresholdType) {
        var deferred = Q.defer();
        if (thresholdType == 1) {
            // var strQuery = 'SELECT p.`user_id`, us.`user_phone`, us.`user_sendSms`, th.*, sta.`station_id` ';
            // strQuery    += 'FROM `data` as d JOIN `pond` AS p ON d.`pond_id` = p.`pond_id` JOIN `user` AS us ON p.`user_id` = us.`user_id` JOIN `stocking_pond` AS stp ON d.`pond_id` = stp.`pond_id` JOIN `stocking` AS st ON st.`stocking_id` = stp.`stocking_id` AND  d.`data_createdDate` > stp.`stockpond_date` AND st.`stocking_status` = 1 JOIN `age` AS ag ON CURDATE() BETWEEN DATE_ADD(stp.`stockpond_date`, INTERVAL ( ag.`age_valueMin` + stp.`stockpond_age`) DAY) AND DATE_ADD(stp.`stockpond_date`, INTERVAL ( ag.`age_valueMax` + stp.`stockpond_age`) DAY) JOIN `species` AS sp ON st.`species_id` = sp.`species_id` JOIN `station` as sta ON d.`station_id` = sta.`station_id` JOIN `threshold` AS th ON th.`datatype_id` = d.`datatype_id` AND th.`age_id` = ag.`age_id` AND th.`region_id` = sta.`region_id` AND th.`species_id` = sp.`species_id` AND d.`data_value` BETWEEN th.`threshold_start` AND th.`threshold_end` AND th.`threshold_level` >0 AND th.`threshold_type` = 1 ';
            // strQuery    += ' WHERE d.`data_id` = :data_id  GROUP BY th.`threshold_id`';
            var strQuery = 'CALL CheckThresholdData( :data_id, 1);';
        } else if (thresholdType == 0) {
            // var strQuery = 'SELECT th.*, sta.`station_id` ';
            // strQuery    += 'FROM `data` AS d JOIN `station` AS sta ON d.`station_id` = sta.`station_id` JOIN `threshold` AS th ON th.`datatype_id` = d.`datatype_id` AND th.`region_id` = sta.`region_id` AND d.`data_value` BETWEEN th.`threshold_start` AND th.`threshold_end` AND th.`threshold_level` > 0 AND th.`threshold_type` = 0 ';
            // strQuery    += ' WHERE d.`data_id` = :data_id GROUP BY th.`threshold_id`';
            var strQuery = 'CALL CheckThresholdData( :data_id, 0);';
        }
        model.sequelize.query(strQuery, { replacements: { data_id: dataID }, type: model.sequelize.QueryTypes.SELECT })
            .then(function(data) {
                var array = Object.keys(data[0]).map(function(key) { return data[0][key]; });
                deferred.resolve(array);
            });
        return deferred.promise;
    },

    Add: function(dataNew, done) {
        model.data.create(dataNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    AddMulti: function(dataArray, done) {
        var result = {
            rowAff: 0,
            data: []
        };
        dataArray.forEach(function(dataNew) {
            model.data.create(dataNew).then(function(data) {
                result.rowAff += 1;
                result.data.push(data);
                if (result.rowAff == dataArray.length)
                    return done(HttpStatus.CREATED, result.data);
            }).catch(function(error) {
                if (error)
                    return done(HttpStatus.BAD_REQUEST, error);
            });
        });
    },

    Update: function(dataNew, id, done) {
        dataNew.data_id = id;
        model.data.update(dataNew, {
            where: { data_id: id }
        }).then(function(data) {
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, id, done) {
        model.data.destroy({ where: { data_id: id } }).then(function(data) {
            return done(HttpStatus.OK, obj);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }

}