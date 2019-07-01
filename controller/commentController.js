var model = require('../models'),
    service = require('../services/Infrastructure'),
    commentService = require('../services/CommentService'),
    answerCommentService = require('../services/AnswerCommentService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function COMMENT_CONTROLLER(routerComment) {
    var self = this;
    self.handleRoutes(routerComment);
}

COMMENT_CONTROLLER.prototype.handleRoutes = function(routerComment) {
    var self = this;
    //Lấy danh sách
    /*routerComment.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            commentService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });*/

    //Lấy danh sách có phân trang
    routerComment.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            commentService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerComment.get("/getbyid/:comment_id", function(req, res) {
        try {
            commentService.GetById(req.params.comment_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo post
    // getbypost/:post_id?page=...&pageSize=...
    routerComment.get("/getbypost/:post_id", function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            commentService.GetByPostId(req.params.post_id, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo email hoặc name
    // /getbyperson?keyword=...
    routerComment.get("/getbyperson", function(req, res) {
        try {
            commentService.GetByEmailOrName(req.query.keyword, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerComment.post("/create", function(req, res) {
        var body = req.body;
        body.comment_commentDate = moment(new Date()).tz(config.timezoneDefault)._d;
        commentService.MapComment(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                commentService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerComment.put("/update/:comment_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.comment_commentDate = moment(new Date()).tz(config.timezoneDefault)._d;
        commentService.MapComment(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                commentService.Update(data, req.params.comment_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin 
    routerComment.delete("/delete/:comment_id", auth.isJwtAuthenticated, function(req, res) {
        commentService.GetById(req.params.comment_id, function(dataFind) {
            if (dataFind) {
                commentService.Delete(dataFind, req.params.comment_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });

    //Xóa tất các comment của 1 post
    routerComment.delete("/deletemulti/:post_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            commentService.DeleteByPost(req.params.post_id, function(statusCode, data) {
                return service.CreateResponse(statusCode, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

}

module.exports = COMMENT_CONTROLLER;