var model = require('../models'),
    service = require('../services/Infrastructure'),
    stationDefaultService = require('../services/StationDefaultService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function STATIONDEFAULT_CONTROLLER(router) {
    var self = this;
    self.handleRoutes(router);
}

STATIONDEFAULT_CONTROLLER.prototype.handleRoutes = function(router) {

    //Lấy danh sách có phân trang
    router.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            stationDefaultService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy chi tiết 1 dữ liệu
    // /getbyid?user_id=...&station_id=...
    router.get("/getbyid", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationDefaultService.GetById(req.query.station_id, req.query.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy trạm default theo user
    router.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationDefaultService.GetByUser(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo station
    router.get("/getlistbystation/:station_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationDefaultService.GetListByStation(req.params.station_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    // /create?user_id=...&station_id=...
    router.post("/create", auth.isJwtAuthenticated, function(req, res) {
        stationDefaultService.GetByUser(req.query.user_id, function(data) {
            if (data && data != null) {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objExist);
            } else {
                var body = {
                    user_id: req.query.user_id,
                    station_id: req.query.station_id
                };
                stationDefaultService.MapStationDefault(body, function(statusCode, data) {
                    if (statusCode == HttpStatus.BAD_REQUEST)
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
                    else {
                        stationDefaultService.Add(data, function(statusCode, dataNew) {
                            return service.CreateResponse(statusCode, res, dataNew);
                        });
                    }
                });
            }
        });

    });

    //Cập nhật thông tin
    // /update?user_id=...&station_id=...
    router.put("/update", auth.isJwtAuthenticated, function(req, res) {
        stationDefaultService.GetById(req.query.station_id, req.query.user_id, function(data) {
            if (data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            } else {
                var body = {
                    user_id: req.query.user_id,
                    station_id: req.query.station_id
                };
                stationDefaultService.MapStationDefault(body, function(statusCode, data) {
                    if (statusCode == HttpStatus.BAD_REQUEST)
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
                    else {
                        stationDefaultService.Update(data, req.query.user_id, function(statusCode, dataNew) {
                            return service.CreateResponse(statusCode, res, dataNew);
                        });
                    }
                });
            }
        });
    });

    //Xóa thông tin
    router.delete("/delete/:user_id", auth.isJwtAuthenticated, function(req, res) {
        stationDefaultService.GetByUser(req.params.user_id, function(dataFind) {
            if (dataFind) {
                stationDefaultService.Delete(dataFind, req.params.user_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data);
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = STATIONDEFAULT_CONTROLLER;