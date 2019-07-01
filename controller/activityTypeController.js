var model = require('../models'),
    service = require('../services/Infrastructure'),
    activityTypeService = require('../services/ActivityTypeService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function ACTIVITYTYPE_CONTROLLER(routerActivityType) {
    var self = this;
    self.handleRoutes(routerActivityType);
}

ACTIVITYTYPE_CONTROLLER.prototype.handleRoutes = function(routerActivityType) {
    var self = this;
    //Lấy toàn bộ danh sách
    /*routerActivityType.get("/getall",auth.isJwtAuthenticated, function(req,res){
        try {
            activityTypeService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerActivityType.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            activityTypeService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo id của loại
    routerActivityType.get("/getbyid/:actitype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityTypeService.GetById(req.params.actitype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin loại
    routerActivityType.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        activityTypeService.MapActivityType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                activityTypeService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loại
    routerActivityType.put("/update/:actitype_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        activityTypeService.MapActivityType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                activityTypeService.Update(data, req.params.actitype_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loại 
    routerActivityType.delete("/delete/:actitype_id", auth.isJwtAuthenticated, function(req, res) {
        activityTypeService.GetById(req.params.actitype_id, function(dataFind) {
            if (dataFind) {
                activityTypeService.Delete(dataFind, req.params.actitype_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = ACTIVITYTYPE_CONTROLLER;