var model = require('../models'),
    service = require('../services/Infrastructure'),
    harvestService = require('../services/HarvestService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function HARVEST_CONTROLLER(routerHarvest) {
    var self = this;
    self.handleRoutes(routerHarvest);
}

HARVEST_CONTROLLER.prototype.handleRoutes = function(routerHarvest) {
    var self = this;
    //Lấy danh sách
    routerHarvest.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            harvestService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerHarvest.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            harvestService.GetAllByKeyword(req.params.user_id, params.stocking_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerHarvest.get("/getbyid/:harvest_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            harvestService.GetById(req.params.harvest_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo loại vật liệu
    routerHarvest.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            harvestService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo stocking_id
    routerHarvest.get("/getbystocking/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            harvestService.GetByStockingId(req.params.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerHarvest.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        harvestService.MapHarvest(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                harvestService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerHarvest.put("/update/:harvest_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        harvestService.MapHarvest(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                harvestService.Update(data, req.params.harvest_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin một
    routerHarvest.delete("/delete/:harvest_id", auth.isJwtAuthenticated, function(req, res) {
        harvestService.GetById(req.params.harvest_id, function(dataFind) {
            if (dataFind) {
                harvestService.Delete(dataFind, req.params.harvest_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = HARVEST_CONTROLLER;