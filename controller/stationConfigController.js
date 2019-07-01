var model = require('../models'),
    service = require('../services/Infrastructure'),
    stationConfigService = require('../services/StationConfigService'),
    stationService = require('../services/StationService'),
    configTypeService = require('../services/ConfigTypeService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    socketService = require('../services/Socket'),
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function STATIONCONFIG_CONTROLLER(routerStationConfig) {
    var self = this;
    self.handleRoutes(routerStationConfig);
}

STATIONCONFIG_CONTROLLER.prototype.handleRoutes = function(routerStationConfig) {
    var self = this;
    //Lấy danh sách tất cả các station
    /*routerStationConfig.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            stationConfigService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerStationConfig.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            stationConfigService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin
    routerStationConfig.get("/getbyid/:stationconfig_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationConfigService.GetById(req.params.stationconfig_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách thiết lập cấu hình mới nhất theo staion_id nếu tồn tại
    //Hàm được dùng cho công tác quản lý
    routerStationConfig.get("/getbystationid/:station_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationConfigService.GetListByStationID(req.params.station_id).then(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách cấu hình theo trạm và chưa được cập nhật
    //Hàm được dùng cho arduino với giải pháp cấu hình trễ 1 chu kỳ.
    routerStationConfig.get("/getbystation/:station_code", function(req, res) {
        try {
            var dataResult = {};
            var dataLast = {
                arrRow: []
            }
            stationService.GetByCode(req.params.station_code).then(function(station) {
                if (station) {
                    // 0: nếu đã được cập nhật, 1: nếu chưa cập nhật
                    stationConfigService.GetByStationAndStatus(station.dataValues.station_id, 1, function(data) {
                        if (data.length > 0)
                            data.forEach(function(item, index) {
                                configTypeService.GetCmdKeyWordById(item.configtype_id).then(function(cmdKeyword) {
                                    if (dataLast.arrRow.indexOf(index) == -1) {
                                        dataLast.arrRow.push(index);
                                    }
                                    if (data) {
                                        dataResult[cmdKeyword.dataValues.configtype_cmdKeyword] = item.stationconfig_value;
                                    }
                                    if (dataLast.arrRow.length == data.length) {
                                        return service.CreateResponse(config.dataResult, res, dataResult);
                                    }
                                });
                            });
                        else
                            return service.CreateResponse(config.dataResult, res, null);
                    });
                } else {
                    return service.CreateResponse(config.dataResult, res, { ERROR: "TRUE" });
                }
            });
        } catch (error) {
            return service.CreateResponse(config.dataResult, res, { ERROR: "TRUE" });
        }
    });

    //Sau khi cập nhật dưới trạm sẽ gọi để xác nhận
    // /configresult/{string10}?result=...
    // 0: nếu thất bại, 1: nếu thành công
    routerStationConfig.get("/configresult/:station_code", function(req, res) {
        var params = req.query;
        var io = res.io;
        var obj = {};
        var dataLast = {
                arrRow: []
            }
            //Nếu thất bại thì cập nhật trạng thái station_updateStatus = null
        if (params.result == 0) {
            stationService.GetByCode(req.params.station_code).then(function(station) {
                if (station) {
                    stationService.Update({
                        station_updateStatus: null //Thông báo cập nhật cấu hình thất bại
                    }, station.station_id, function(statusCode, dataNew) {
                        if (statusCode == HttpStatus.OK) {
                            return service.CreateResponse(config.dataResult, res, { RESULT: "UPDATESUCCESS" });
                        } else {
                            return service.CreateResponse(config.dataResult, res, { RESULT: "UPDATEFAIL" });
                        }
                    });
                } else {
                    return service.CreateResponse(config.dataResult, res, { RESULT: "CODEFAIL" });
                }
            });
        } else if (params.result == 1) { //Cập nhật thành công
            stationService.GetByCode(req.params.station_code).then(function(station) {
                if (station) {
                    stationConfigService.GetByStationAndStatus(station.station_id, 1, function(data) {
                        if (data.length > 0) {
                            obj.station_updateStatus = 0;
                            data.forEach(function(item, index) {
                                configTypeService.GetVariableById(item.dataValues.configtype_id).then(function(variable) {
                                    if (dataLast.arrRow.indexOf(index) == -1) {
                                        dataLast.arrRow.push(index);
                                    }
                                    if (data) {
                                        obj[variable.dataValues.configtype_variable] = item.dataValues.stationconfig_value;
                                    }
                                    if (dataLast.arrRow.length == data.length) {
                                        stationConfigService.UpdateStatus(station.station_id, 1, 0).then(function(flag) {});
                                        stationService.Update(obj, station.station_id, function(statusCode, dataNew) {
                                            if (statusCode == HttpStatus.OK) {
                                                return service.CreateResponse(config.dataResult, res, { RESULT: "UPDATESUCCESS" });
                                            } else {
                                                return service.CreateResponse(config.dataResult, res, { RESULT: "UPDATEFAIL" });
                                            }
                                        });
                                    }
                                });
                            });
                        } else {
                            return service.CreateResponse(config.dataResult, res, { RESULT: "UPDATEFAIL" });
                        }
                    });
                } else {
                    return service.CreateResponse(config.dataResult, res, { RESULT: "CODEFAIL" });
                }
            });
        }
    });

    /*
        //Cấu hình trạm
        //Nhận vào là một đôi tượng cấu hình dạng json
        {
            station_id: ...,
            station_config: [
                {
                    "configtype_id": ...,
                    "stationconfig_value": ...
                },
                {...}
            ]
        }
        - Hàm sẽ kiểm tra nếu station_updateStatus của trạm là 0 (tức không có các thay đổi chờ cập nhật) sẽ tiến hành thêm mới các cấu hình, 
          và thay đổi trạng thái trạm thành chờ cập nhật
        - Nếu station_updateStatus = 1 (tức đang có thay đổi chờ cập nhật) thì sẽ tiến hành update các thay đổi đang tồn tại, và thêm mới các thay đổi mới.
    */
    routerStationConfig.post("/setup", auth.isJwtAuthenticated, function(req, res) {
        //var io = res.io;
        var body = req.body;
        body.stationconfig_createDate = moment(new Date()).tz(config.timezoneDefault)._d;
        body.stationconfig_status = 1;
        stationService.GetById(body.station_id, function(station) {
            if (station && station.station_id > 0) {
                if (body.station_config && body.station_config.length > 0) {
                    stationConfigService.MapStationConfig(body, function(statusCode, arrData) {
                        if (statusCode == HttpStatus.BAD_REQUEST)
                            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, arrData);
                        else {
                            if (station.station_updateStatus != 1) {
                                stationConfigService.AddMulti(arrData, function(statusCode, dataNew) {
                                    if (statusCode == HttpStatus.OK) {
                                        stationService.Update({
                                            station_updateStatus: 1
                                        }, body.station_id, function(statusCode, dataStation) {
                                            if (statusCode == HttpStatus.OK) {
                                                res.io.of('/esp8266').emit("N_" + station.station_code, "");
                                                return service.CreateResponse(statusCode, res, dataNew);
                                            } else {
                                                return service.CreateResponse(statusCode, res, dataStation);
                                            }
                                        });
                                    } else {
                                        return service.CreateResponse(statusCode, res, dataNew);
                                    }
                                });
                            } else {
                                stationConfigService.UpdateSert(arrData, function(statusCode, dataNew) {
                                    if (statusCode == HttpStatus.OK) {
                                        res.io.of(config.nameSpaceSocket).emit("N_" + station.station_code, "");
                                        return service.CreateResponse(statusCode, res, dataNew);
                                    } else {
                                        return service.CreateResponse(statusCode, res, dataNew);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, "station_config is not null");
                }
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
            }
        });
    });

    //Xóa một 1 cấu hình của 1 trạm nào đó chưa được cập nhật, nếu cấu hình đã được cập nhật sẽ không thể xóa.
    routerStationConfig.delete("/delete/:stationconfig_id", auth.isJwtAuthenticated, function(req, res) {
        stationConfigService.GetByIdAndStatus(req.params.stationconfig_id, 1, function(dataFind) {
            if (dataFind) {
                stationConfigService.Delete(dataFind, req.params.stationconfig_id, function(statusCode, data) {
                    if (statusCode == HttpStatus.OK) {
                        stationConfigService.GetByStationAndStatus(dataFind.station_id, 1, function(dataConfig) {
                            if (dataConfig)
                                return service.CreateResponse(statusCode, res, data);
                            else {
                                stationService.Update({
                                    station_updateStatus: 0
                                }, dataFind.station_id, function(statusCode, dataStation) {
                                    if (statusCode == HttpStatus.OK) {
                                        return service.CreateResponse(statusCode, res, data);
                                    } else {
                                        return service.CreateResponse(statusCode, res, dataStation);
                                    }
                                });
                            }
                        });
                    } else {
                        return service.CreateResponse(statusCode, res, data);
                    }
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });

    //Xóa toàn bộ các cấu hình của 1 trạm khi chưa được cập nhật trên trạm
    routerStationConfig.delete("/deletestation/:station_id", auth.isJwtAuthenticated, function(req, res) {
        stationService.GetById(req.params.station_id, function(dataStation) {
            if (dataStation && dataStation.station_updateStatus == 1) {
                stationConfigService.DeleteMulti(dataStation.station_id, 1, function(statusCode, data) {
                    if (statusCode == HttpStatus.OK) {
                        stationService.Update({
                            station_updateStatus: 0
                        }, req.params.station_id, function(statusCode, dataStation) {
                            if (statusCode == HttpStatus.OK) {
                                return service.CreateResponse(statusCode, res, data);
                            } else {
                                return service.CreateResponse(statusCode, res, dataStation);
                            }
                        });
                    } else {
                        return service.CreateResponse(statusCode, res, data);
                    }
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });
}

module.exports = STATIONCONFIG_CONTROLLER;