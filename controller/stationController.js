var model = require('../models'),
    service = require('../services/Infrastructure'),
    stationService = require('../services/StationService'),
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


function STATION_CONTROLLER(routerStation) {
    var self = this;
    self.handleRoutes(routerStation);
}

STATION_CONTROLLER.prototype.handleRoutes = function(routerStation) {
    var self = this;
    //Lấy danh sách các station
    routerStation.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    /*
        //Lấy danh sách có phân trang theo user_id
        //Truyền vào các tham số
            user_id: là id của người dùng, truyền dạng params
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo tên trạm (station_name)
            3 biến trên truyền theo dạng query
        url: /getpagination/:user_id?page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerStation.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    regionService.GetListByUser(dataUser).then(function(dataRegion) {
                        if (dataRegion.length > 0) {
                            if (dataUser.user_levelManager > 0) {
                                stationService.GetListByArrRegionId(dataRegion, params.keyword || '', page, params.pageSize || config.pageSizeDefault).then(function(dataStation) {
                                    service.PaginationSet(dataStation, dataStation.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                                        return service.CreateResponse(HttpStatus.OK, res, dataNew);
                                    });
                                });
                            } else if (dataUser.user_levelManager == 0) {
                                stationService.GetListByArrRegionIdForFarmer(req.params.user_id, dataRegion, params.keyword || '', page, params.pageSize || config.pageSizeDefault).then(function(dataStation) {
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

    //Lấy thông tin station theo station_id
    routerStation.get("/getbyid/:station_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationService.GetById(req.params.station_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách station theo sink_id
    routerStation.get("/getbysink/:sink_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationService.GetBySinkId(req.params.sink_id).then(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy station theo station_code
    routerStation.get("/getbycode/:station_code", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationService.GetByCode(req.params.station_code).then(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách trạm theo user_id
    routerStation.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    regionService.GetListByUser(dataUser).then(function(dataRegion) {
                        if (dataRegion.length > 0) {
                            if (dataUser.user_levelManager > 0) {
                                stationService.GetListByArrRegionId(dataRegion, '', 0, -1).then(function(dataStation) {
                                    return service.CreateResponse(HttpStatus.OK, res, dataStation);
                                });
                            } else if (dataUser.user_levelManager == 0) {
                                stationService.GetListByArrRegionIdForFarmer(req.params.user_id, dataRegion, '', 0, -1).then(function(dataStation) {
                                    return service.CreateResponse(HttpStatus.OK, res, dataStation);
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

    //Lấy danh sách station theo region
    routerStation.get("/getbyregion/:region_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stationService.GetListByRegion(req.params.region_id).then(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin station
    routerStation.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        stationService.MapStation(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stationService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin trạm
    routerStation.put("/update/:station_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        stationService.MapStation(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stationService.Update(data, req.params.station_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa một trạm
    routerStation.delete("/delete/:station_id", auth.isJwtAuthenticated, function(req, res) {
        stationService.GetById(req.params.station_id, function(dataFind) {
            if (dataFind) {
                stationService.Delete(dataFind, req.params.station_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });
    //Cập nhật trạm sau khi xóa
    routerStation.put("/updateafter/:station_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        stationService.MapStation(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stationService.isDelete(req.params.station_id, function(data) {
                    return service.CreateResponse(HttpStatus.OK, res, data);
                });
            }
        });
    });
}

module.exports = STATION_CONTROLLER;