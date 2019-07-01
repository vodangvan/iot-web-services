var model = require('../models'),
    service = require('../services/Infrastructure'),
    roleService = require('../services/RoleService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function ROLE_CONTROLLER(routerRole) {
    var self = this;
    self.handleRoutes(routerRole);
}

ROLE_CONTROLLER.prototype.handleRoutes = function(routerRole) {
    var self = this;
    //Lấy danh sách tất cả các role
    routerRole.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            roleService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerRole.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            roleService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin quyền theo id
    routerRole.get("/getbyid/:role_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            roleService.GetById(req.params.role_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin role
    routerRole.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        roleService.MapRole(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                roleService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin role
    routerRole.put("/update/:role_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        roleService.MapRole(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                roleService.Update(data, req.params.role_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

}

module.exports = ROLE_CONTROLLER;