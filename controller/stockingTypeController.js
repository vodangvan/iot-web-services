var model = require('../models'),
    service = require('../services/Infrastructure'),
    stockingTypeService = require('../services/StockingTypeService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function STOCKINGTYPE_CONTROLLER(routerStockingType) {
    var self = this;
    self.handleRoutes(routerStockingType);
}

STOCKINGTYPE_CONTROLLER.prototype.handleRoutes = function(routerStockingType) {
    var self = this;
    //Lấy danh sách
    routerStockingType.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingTypeService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerStockingType.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            stockingTypeService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerStockingType.get("/getbyid/:stockingtype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingTypeService.GetById(req.params.stockingtype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerStockingType.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        stockingTypeService.MapStockingType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stockingTypeService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerStockingType.put("/update/:stockingtype_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        stockingTypeService.MapStockingType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stockingTypeService.Update(data, req.params.stockingtype_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin 
    routerStockingType.delete("/delete/:stockingtype_id", auth.isJwtAuthenticated, function(req, res) {
        stockingTypeService.GetById(req.params.stockingtype_id, function(dataFind) {
            if (dataFind) {
                stockingTypeService.Delete(dataFind, req.params.stockingtype_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = STOCKINGTYPE_CONTROLLER;