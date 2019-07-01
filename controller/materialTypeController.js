var model = require('../models'),
    service = require('../services/Infrastructure'),
    materialTypeService = require('../services/MaterialTypeService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function MATERIALTYPE_CONTROLLER(routerMaterialType) {
    var self = this;
    self.handleRoutes(routerMaterialType);
}

MATERIALTYPE_CONTROLLER.prototype.handleRoutes = function(routerMaterialType) {
    var self = this;
    //Lấy danh sách các loại vật liệu
    /*routerMaterialType.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            materialTypeService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerMaterialType.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            materialTypeService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm loại vật liệu theo ID
    routerMaterialType.get("/getbyid/:materialtype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialTypeService.GetById(req.params.materialtype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin loại vật liệu
    routerMaterialType.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        materialTypeService.MapMaterialType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                materialTypeService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loại vật liệu
    routerMaterialType.put("/update/:materialtype_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        materialTypeService.MapMaterialType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                materialTypeService.Update(data, req.params.materialtype_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loại vật liệu
    routerMaterialType.delete("/delete/:materialtype_id", auth.isJwtAuthenticated, function(req, res) {
        materialTypeService.GetById(req.params.materialtype_id, function(dataFind) {
            if (dataFind) {
                materialTypeService.Delete(dataFind, req.params.materialtype_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = MATERIALTYPE_CONTROLLER;