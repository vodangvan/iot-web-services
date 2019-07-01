var model = require('../models'),
    service = require('../services/Infrastructure'),
    riverService = require('../services/RiverService'),
    regionService = require('../services/RegionService'),
    userService = require('../services/UserService'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    HttpStatus = require('http-status-codes'),
    config = require('../config/config.json')[env];

function RIVER_CONTROLLER(routerRiver) {
    var self = this;
    self.handleRoutes(routerRiver);
}

RIVER_CONTROLLER.prototype.handleRoutes = function(routerRiver) {
    var self = this;
    //Lấy toàn bộ danh sách sông/kênh
    routerRiver.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            riverService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách có phân trang
    routerRiver.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    regionService.GetListByUser(dataUser).then(function(dataRegion) {
                        if (dataRegion.length > 0) {
                            var arrRegionId = [];
                            dataRegion.forEach(function(region) {
                                arrRegionId.push(region.region_id);
                                if (arrRegionId.length == dataRegion.length) {
                                    riverService.GetAllByKeyword(arrRegionId, params.keyword || '', page, params.pageSize || config.pageSizeDefault, function(data) {
                                        service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                                            return service.CreateResponse(HttpStatus.OK, res, dataNew);
                                        });
                                    });
                                };
                            });
                        } else {
                            return service.CreateResponse(HttpStatus.OK, res, null);
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

    //Tìm thông tin sông/kênh
    routerRiver.get("/getbyid/:river_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            riverService.GetById(req.params.river_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo region_id
    routerRiver.get("/getbyregion/:region_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            riverService.GetListByRegion(req.params.region_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách sông theo user_id
    //Nhận vào là user_id, tìm kiếm các vùng thuộc người đó quản lý nếu là người quản lý
    //hoặc các vùng mà người nông dân có ao ở đó nếu là nông dân
    routerRiver.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.GetById(req.params.user_id, function(dataUser) {
                regionService.GetListByUser(dataUser).then(function(dataRegion) {
                    if (dataRegion.length > 0) {
                        var arrRegionId = [];
                        dataRegion.forEach(function(region) {
                            arrRegionId.push(region.region_id);
                            if (arrRegionId.length == dataRegion.length) {
                                riverService.GetListByRegionArray(arrRegionId, function(data) {
                                    return service.CreateResponse(HttpStatus.OK, res, data);
                                });
                            };
                        });
                    } else {
                        return service.CreateResponse(HttpStatus.OK, res, null);
                    }
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin sông/kênh
    routerRiver.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        riverService.MapRiver(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST) {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            } else {
                riverService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin sông/kênh
    routerRiver.put("/update/:river_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        riverService.MapRiver(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                riverService.Update(data, req.params.river_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });

    });
    //Xóa thông tin sông/kênh
    routerRiver.delete("/delete/:river_id", auth.isJwtAuthenticated, function(req, res) {
        riverService.GetById(req.params.river_id, function(dataFind) {
            if (dataFind) {
                riverService.Delete(dataFind, req.params.river_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });
    //Cập nhật ao sau khi xóa
    routerRiver.put("/updateafter/:river_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        riverService.MapRiver(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                riverService.isDelete(req.params.river_id, function(data) {
                    return service.CreateResponse(HttpStatus.OK, res, data);
                });
            }
        });
    });
}

module.exports = RIVER_CONTROLLER;