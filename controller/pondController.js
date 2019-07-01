var model = require('../models'),
    service = require('../services/Infrastructure'),
    pondService = require('../services/PondService'),
    userService = require('../services/UserService'),
    locationService = require('../services/LocationService'),
    regionService = require('../services/RegionService'),
    locationManagerService = require('../services/LocationManagerService'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    HttpStatus = require('http-status-codes'),
    config = require('../config/config.json')[env];

function POND_CONTROLLER(routerPond) {
    var self = this;
    self.handleRoutes(routerPond);
}

POND_CONTROLLER.prototype.handleRoutes = function(routerPond) {
    var self = this;
    //Lấy toàn bộ danh sách ao nuôi
    routerPond.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            pondService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    /** 
     * Lấy danh sách có phân trang theo user_id
     *   Truyền vào các tham số
     *       user_id: là id của người dùng, truyền dạng params
     *       page: trang hiện tại
     *       pageSize: kích thước lấy
     *       keyword: từ khóa tìm kiếm theo tên trạm (station_name)
     *       3 biến trên truyền theo dạng query
     *   url: /getpagination/:user_id?page=...&pageSize=...&keyword=...
     *   Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
     *   Và thông tin tổng số phần tử, số trang đã chia.
     **/
    routerPond.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    regionService.GetListByUser(dataUser).then(function(dataRegion) {
                        if (dataRegion.length > 0) {
                            if (dataUser.user_levelManager >= 0) {
                                pondService.GetListByArrRegion(dataRegion, params.keyword || '', page, params.pageSize || config.pageSizeDefault).then(function(dataPond) {
                                    service.PaginationSet(dataPond, dataPond.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                                        return service.CreateResponse(HttpStatus.OK, res, dataNew);
                                    });
                                });
                            } else if (dataUser.user_levelManager == 0) {
                                pondService.GetListByUser(req.params.user_id, params.keyword || '', page, params.pageSize || config.pageSizeDefault, function(dataPond) {
                                    service.PaginationSet(dataPond, dataPond.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
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

    //Tìm thông tin ao nuôi theo id ao
    routerPond.get("/getbyid/:pond_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            pondService.GetById(req.params.pond_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách ao nuôi theo người dùng

    routerPond.get("/getlistbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    if (dataUser.user_levelManager > 0) {
                        regionService.GetListByUser(dataUser).then(function(dataRegion) {
                            if (dataRegion.length > 0) {
                                pondService.GetListByArrRegion(dataRegion, '', 0, -1).then(function(dataPond) {
                                    return service.CreateResponse(HttpStatus.OK, res, dataPond);
                                });
                            } else {
                                return service.CreateResponse(HttpStatus.OK, res, dataRegion);
                            }
                        });
                    } else {
                        pondService.GetListByUser(req.params.user_id, '', 0, -1, function(dataPond) {
                            return service.CreateResponse(HttpStatus.OK, res, dataPond);
                        });
                    }
                } else {
                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                }
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách ao nuôi theo region
    routerPond.get("/getbyregion/:region_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            pondService.GetListByRegion(req.params.region_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin ao nuôi
    routerPond.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        pondService.MapPond(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST) {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            } else {
                pondService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerPond.put("/update/:pond_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        pondService.MapPond(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                pondService.Update(data, req.params.pond_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });

    });
    //Xóa thông tin ao
    routerPond.delete("/delete/:pond_id", auth.isJwtAuthenticated, function(req, res) {
        pondService.GetById(req.params.pond_id, function(dataFind) {
            if (dataFind) {
                pondService.Delete(dataFind, req.params.pond_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });
    //Cập nhật ao sau khi xóa
    routerPond.put("/updateafter/:pond_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        pondService.MapPond(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                pondService.isDelete(req.params.pond_id, function(data) {
                    return service.CreateResponse(HttpStatus.OK, res, data);
                });
            }
        });
    });

}

module.exports = POND_CONTROLLER;