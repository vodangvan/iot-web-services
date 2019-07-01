var model = require('../models'),
    service = require('../services/Infrastructure'),
    configTypeService = require('../services/ConfigTypeService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function CONFIGTYPE_CONTROLLER(routerConfigType) {
    var self = this;
    self.handleRoutes(routerConfigType);
}

CONFIGTYPE_CONTROLLER.prototype.handleRoutes = function(routerConfigType) {
    var self = this;
    //Lấy danh sách
    routerConfigType.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            configTypeService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerConfigType.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            configTypeService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerConfigType.get("/getbyid/:configtype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            configTypeService.GetById(req.params.configtype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách của loại cấu hình theo id của loại cấu hình tra
    routerConfigType.get("/getlistbyparentid/:configtype_parentId", auth.isJwtAuthenticated, function(req, res) {
        try {
            configTypeService.GetListByParentId(req.params.configtype_parentId, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerConfigType.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        configTypeService.MapConfigType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                configTypeService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerConfigType.put("/update/:configtype_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        configTypeService.MapConfigType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                configTypeService.Update(data, req.params.configtype_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerConfigType.delete("/delete/:configtype_id", auth.isJwtAuthenticated, function(req, res) {
        configTypeService.GetById(req.params.configtype_id, function(dataFind) {
            if (dataFind) {
                configTypeService.Delete(dataFind, req.params.configtype_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = CONFIGTYPE_CONTROLLER;