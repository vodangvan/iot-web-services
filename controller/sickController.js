var model = require('../models'),
    service = require('../services/Infrastructure'),
    sickService = require('../services/SickService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function SICK_CONTROLLER(routerSick) {
    var self = this;
    self.handleRoutes(routerSick);
}

SICK_CONTROLLER.prototype.handleRoutes = function(routerSick) {
    var self = this;
    //Lấy danh sách các loại tuổi nuôi
    routerSick.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            sickService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerSick.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            sickService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm loại tuổi theo ID
    routerSick.get("/getbyid/:sick_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            sickService.GetById(req.params.sick_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin loại tuổi
    routerSick.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        sickService.MapSick(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                sickService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loại tuổi
    routerSick.put("/update/:sick_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        sickService.MapSick(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                sickService.Update(data, req.params.sick_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loại tuổi
    routerSick.delete("/delete/:sick_id", auth.isJwtAuthenticated, function(req, res) {
        sickService.GetById(req.params.sick_id, function(dataFind) {
            if (dataFind) {
                sickService.Delete(dataFind, req.params.sick_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = SICK_CONTROLLER;