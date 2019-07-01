var model = require('../models'),
    service = require('../services/Infrastructure'),
    landBackgroundService = require('../services/LandBackgroundService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function LANDBACKGROUND_CONTROLLER(routerLandBackground) {
    var self = this;
    self.handleRoutes(routerLandBackground);
}

LANDBACKGROUND_CONTROLLER.prototype.handleRoutes = function(routerLandBackground) {
    var self = this;
    //Lấy danh sách
    routerLandBackground.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            landBackgroundService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerLandBackground.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            landBackgroundService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerLandBackground.get("/getbyid/:landbg_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            landBackgroundService.GetById(req.params.landbg_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerLandBackground.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        landBackgroundService.MapLandBackground(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                landBackgroundService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerLandBackground.put("/update/:landbg_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        landBackgroundService.MapLandBackground(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                landBackgroundService.Update(data, req.params.landbg_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerLandBackground.delete("/delete/:landbg_id", auth.isJwtAuthenticated, function(req, res) {
        landBackgroundService.GetById(req.params.landbg_id, function(dataFind) {
            if (dataFind) {
                landBackgroundService.Delete(dataFind, req.params.landbg_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = LANDBACKGROUND_CONTROLLER;