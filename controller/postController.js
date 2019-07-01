var model = require('../models'),
    service = require('../services/Infrastructure'),
    postService = require('../services/PostService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function POST_CONTROLLER(routerPost) {
    var self = this;
    self.handleRoutes(routerPost);
}

POST_CONTROLLER.prototype.handleRoutes = function(routerPost) {
    var self = this;
    //Lấy danh sách
    /*routerPost.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            postService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });*/

    //Lấy danh sách có phân trang
    routerPost.get("/getpagination", function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            postService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerPost.get("/getbyid/:post_id", function(req, res) {
        try {
            postService.GetById(req.params.post_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo category
    routerPost.get("/getbypostcategory/:postcate_id", function(req, res) {
        try {
            postService.GetByPostCategoryId(req.params.postcate_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo user
    routerPost.get("/getbyuser/:user_id", function(req, res) {
        try {
            postService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerPost.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.post_createDate = moment(new Date()).tz(config.timezoneDefault)._d;
        postService.MapPost(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                postService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerPost.put("/update/:post_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.post_updateDate = moment(new Date()).tz(config.timezoneDefault)._d;
        postService.MapPost(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                postService.Update(data, req.params.post_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin 
    routerPost.delete("/delete/:post_id", auth.isJwtAuthenticated, function(req, res) {
        postService.GetById(req.params.post_id, function(dataFind) {
            if (dataFind) {
                postService.Delete(dataFind, req.params.post_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = POST_CONTROLLER;