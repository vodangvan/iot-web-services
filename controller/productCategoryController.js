var model = require('../models'),
    service = require('../services/Infrastructure'),
    productCategoryService = require('../services/ProductCategoryService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function PRODUCTCATEGORY_CONTROLLER(routerProductCategory) {
    var self = this;
    self.handleRoutes(routerProductCategory);
}

PRODUCTCATEGORY_CONTROLLER.prototype.handleRoutes = function(routerProductCategory) {
    var self = this;
    //Lấy danh sách các
    /*routerProductCategory.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            productCategoryService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerProductCategory.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            productCategoryService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách toàn bộ id và name của productcategory
    routerProductCategory.get("/getallname", auth.isJwtAuthenticated, function(req, res) {
        try {
            productCategoryService.GetAllName(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerProductCategory.get("/getbyid/:prodcate_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            productCategoryService.GetById(req.params.prodcate_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerProductCategory.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.prodcate_createDate = moment(new Date()).tz(config.timezoneDefault)._d;
        productCategoryService.MapProductCategory(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                productCategoryService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerProductCategory.put("/update/:prodcate_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.prodcate_updateDate = moment(new Date()).tz(config.timezoneDefault)._d;
        productCategoryService.MapProductCategory(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                productCategoryService.Update(data, req.params.prodcate_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerProductCategory.delete("/delete/:prodcate_id", auth.isJwtAuthenticated, function(req, res) {
        productCategoryService.GetById(req.params.prodcate_id, function(dataFind) {
            if (dataFind) {
                productCategoryService.Delete(dataFind, req.params.prodcate_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = PRODUCTCATEGORY_CONTROLLER;