var model = require('../models'),
    service = require('../services/Infrastructure'),
    unitService = require('../services/UnitService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function UNIT_CONTROLLER(routerUnit) {
    var self = this;
    self.handleRoutes(routerUnit);
}

UNIT_CONTROLLER.prototype.handleRoutes = function(routerUnit) {
    var self = this;
    //Lấy danh sách các đơn vị
    routerUnit.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            unitService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerUnit.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            unitService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerUnit.get("/getbyid/:unit_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            unitService.GetById(req.params.unit_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerUnit.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        unitService.MapUnit(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                unitService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerUnit.put("/update/:unit_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        unitService.MapUnit(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                unitService.Update(data, req.params.unit_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin 
    routerUnit.delete("/delete/:unit_id", auth.isJwtAuthenticated, function(req, res) {
        unitService.GetById(req.params.unit_id, function(dataFind) {
            if (dataFind) {
                unitService.Delete(dataFind, req.params.unit_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = UNIT_CONTROLLER;