var model = require('../models'),
    service = require('../services/Infrastructure'),
    sinkService = require('../services/SinkService'),
    userService = require('../services/UserService'),
    locationService = require('../services/LocationService'),
    regionService = require('../services/RegionService'),
    locationManagerService = require('../services/LocationManagerService'),
    pondService = require('../services/PondService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    randomstring = require("randomstring"),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function SINK_CONTROLLER(routerSink) {
    var self = this;
    self.handleRoutes(routerSink);
}

SINK_CONTROLLER.prototype.handleRoutes = function(routerSink) {
    var self = this;
    //Lấy danh sách các trạm
    routerSink.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            sinkService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerSink.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    regionService.GetListByUser(dataUser).then(function(dataRegion) {
                        if (dataRegion.length > 0) {
                            if (dataUser.user_levelManager > 0) {
                                sinkService.GetByArrRegion(dataRegion, params.keyword || '', page, params.pageSize || config.pageSizeDefault).then(function(dataStation) {
                                    service.PaginationSet(dataStation, dataStation.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                                        return service.CreateResponse(HttpStatus.OK, res, dataNew);
                                    });
                                });
                            } else if (dataUser.user_levelManager == 0) {
                                sinkService.GetListByArrRegionIdForFarmer(req.params.user_id, dataRegion, params.keyword || '', page, params.pageSize || config.pageSizeDefault).then(function(dataStation) {
                                    service.PaginationSet(dataStation, dataStation.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                                        return service.CreateResponse(HttpStatus.OK, res, dataNew);
                                    });
                                });
                            }
                        } else {
                            return service.CreateResponse(HttpStatus.OK, res, dataRegion);
                        }
                    });
                } else {
                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                }
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin trạm theo id trạm
    routerSink.get("/getbyid/:sink_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            sinkService.GetById(req.params.sink_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin trạm theo vùng/khu vực
    routerSink.get("/getbyregion/:region_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            sinkService.GetByRegionId(req.params.region_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin trạm
    routerSink.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        var flag = false;
        do {
            body.sink_code = randomstring.generate(16);
            sinkService.CheckCode(body.sink_code).then(function(data) {
                flag = data;
            });
        } while (flag);
        body.sink_secret = randomstring.generate(16);
        sinkService.MapSink(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                sinkService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin trạm
    routerSink.put("/update/:sink_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        sinkService.MapSink(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                sinkService.Update(data, req.params.sink_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa một trạm
    routerSink.delete("/delete/:sink_id", auth.isJwtAuthenticated, function(req, res) {
        sinkService.GetById(req.params.sink_id, function(dataFind) {
            if (dataFind) {
                sinkService.Delete(dataFind, req.params.sink_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExits });
            }
        });
    });
    //Cập nhật trạm điều hành sau khi xóa
    routerSink.put("/updateafter/:sink_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        sinkService.MapSink(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                sinkService.isDelete(req.params.sink_id, function(data) {
                    return service.CreateResponse(HttpStatus.OK, res, data);
                });
            }
        });
    });
}

module.exports = SINK_CONTROLLER;