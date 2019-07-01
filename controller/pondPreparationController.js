var model = require('../models'),
    service = require('../services/Infrastructure'),
    pondPreparationService = require('../services/PondPreparationService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function PONDPREPARATION_CONTROLLER(routerPondPreparation) {
    var self = this;
    self.handleRoutes(routerPondPreparation);
}

PONDPREPARATION_CONTROLLER.prototype.handleRoutes = function(routerPondPreparation) {
    var self = this;
    //Lấy danh sách các
    routerPondPreparation.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            pondPreparationService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerPondPreparation.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            pondPreparationService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerPondPreparation.get("/getbyid/:pondpreparation_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            pondPreparationService.GetById(req.params.pondpreparation_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo stocking_id và pond_id
    // /getbystockingpond?stocking_id=...&pond_id=...
    routerPondPreparation.get("/getbystockingpond", auth.isJwtAuthenticated, function(req, res) {
        try {
            pondPreparationService.GetByStockingPond(req.query.stocking_id, req.query.pond_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerPondPreparation.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        pondPreparationService.MapPondPreparation(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                pondPreparationService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerPondPreparation.put("/update/:pondpreparation_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        pondPreparationService.MapPondPreparation(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                pondPreparationService.Update(data, req.params.pondpreparation_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerPondPreparation.delete("/delete/:pondpreparation_id", auth.isJwtAuthenticated, function(req, res) {
        pondPreparationService.GetById(req.params.pondpreparation_id, function(dataFind) {
            if (dataFind) {
                pondPreparationService.Delete(dataFind, req.params.pondpreparation_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = PONDPREPARATION_CONTROLLER;