var model = require('../models'),
    service = require('../services/Infrastructure'),
    productTypeService = require('../services/ProductTypeService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function PRODUCTTYPE_CONTROLLER(routerProductType) {
    var self = this;
    self.handleRoutes(routerProductType);
}

PRODUCTTYPE_CONTROLLER.prototype.handleRoutes = function(routerProductType) {
    var self = this;
    //Lấy danh sách
    routerProductType.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            productTypeService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerProductType.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            productTypeService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerProductType.get("/getbyid/:prodtype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            productTypeService.GetById(req.params.prodtype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo category
    routerProductType.get("/getbyproductcategory/:prodcate_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            productTypeService.GetByUserId(req.params.prodcate_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerProductType.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        productTypeService.MapProductType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                productTypeService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerProductType.put("/update/:prodtype_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        productTypeService.MapProductType(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                productTypeService.Update(data, req.params.prodtype_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerProductType.delete("/delete/:prodtype_id", auth.isJwtAuthenticated, function(req, res) {
        productTypeService.GetById(req.params.prodtype_id, function(dataFind) {
            if (dataFind) {
                productTypeService.Delete(dataFind, req.params.prodtype_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = PRODUCTTYPE_CONTROLLER;