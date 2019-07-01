var model = require('../models'),
    service = require('../services/Infrastructure'),
    postCategoryService = require('../services/PostCategoryService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function POSTCATEGORY_CONTROLLER(routerPostCategory) {
    var self = this;
    self.handleRoutes(routerPostCategory);
}

POSTCATEGORY_CONTROLLER.prototype.handleRoutes = function(routerPostCategory) {
    var self = this;
    //Lấy danh sách các
    /*routerPostCategory.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            postCategoryService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerPostCategory.get("/getpagination", function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            postCategoryService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách toàn bộ id và name của productcategory
    routerPostCategory.get("/getallname", auth.isJwtAuthenticated, function(req, res) {
        try {
            postCategoryService.GetAllName(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerPostCategory.get("/getbyid/:postcate_id", function(req, res) {
        try {
            postCategoryService.GetById(req.params.postcate_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerPostCategory.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.postcate_createDate = moment(new Date()).tz(config.timezoneDefault)._d;
        postCategoryService.MapPostCategory(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                postCategoryService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerPostCategory.put("/update/:postcate_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.postcate_updateDate = moment(new Date()).tz(config.timezoneDefault)._d;
        postCategoryService.MapPostCategory(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                postCategoryService.Update(data, req.params.postcate_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerPostCategory.delete("/delete/:postcate_id", auth.isJwtAuthenticated, function(req, res) {
        postCategoryService.GetById(req.params.postcate_id, function(dataFind) {
            if (dataFind) {
                postCategoryService.Delete(dataFind, req.params.postcate_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = POSTCATEGORY_CONTROLLER;