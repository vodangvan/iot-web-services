var model = require('../models'),
    service = require('../services/Infrastructure'),
    threadService = require('../services/ThreadService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function THREAD_CONTROLLER(routerThread) {
    var self = this;
    self.handleRoutes(routerThread);
}

THREAD_CONTROLLER.prototype.handleRoutes = function(routerThread) {
    var self = this;
    //Lấy danh sách
    /*routerThread.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            postService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });*/

    //Lấy danh sách có phân trang
    routerThread.get("/getpagination", function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            threadService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang theo title
    routerThread.get("/getpaginationbytitle/:title", function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            threadService.GetAllByKeyword(req.params.title, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang theo tag
    routerThread.get("/getpaginationbytag/:tag", function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            threadService.GetAllByTag(req.params.tag, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerThread.get("/getbyid/:thread_id", function(req, res) {
        try {
            threadService.GetById(req.params.thread_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo user
    routerThread.get("/getbyuser/:user_id", function(req, res) {
        try {
            threadService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    // //Thêm mới thông tin
    routerThread.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        let time = moment(new Date()).tz(config.timezoneDefault)._d;
        body.thread_time = time;
        body.thread_lastEdit = time;
        body.thread_views = body.thread_votes = body.thread_replies = 0;
        body.thread_tag += " ";
        threadService.MapThread(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                threadService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerThread.put("/update/:thread_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.thread_tag += " ";
        body.thread_lastEdit = moment(new Date()).tz(config.timezoneDefault)._d
        threadService.MapThread(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                threadService.Update(data, req.params.thread_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    // //Xóa thông tin 
    routerThread.delete("/delete/:thread_id", auth.isJwtAuthenticated, function(req, res) {
        threadService.GetById(req.params.thread_id, function(dataFind) {
            if (dataFind) {
                threadService.Delete(dataFind, req.params.thread_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = THREAD_CONTROLLER;