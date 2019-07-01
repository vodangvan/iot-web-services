var model = require('../models'),
    service = require('../services/Infrastructure'),
    answerCommentService = require('../services/AnswerCommentService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function ANSWERCOMMENT_CONTROLLER(routerAnswerComment) {
    var self = this;
    self.handleRoutes(routerAnswerComment);
}

ANSWERCOMMENT_CONTROLLER.prototype.handleRoutes = function(routerAnswerComment) {
    var self = this;
    //Lấy danh sách
    /*routerAnswerComment.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            answerCommentService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });*/

    //Lấy danh sách có phân trang
    routerAnswerComment.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            answerCommentService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerAnswerComment.get("/getbyid/:anscom_id", function(req, res) {
        try {
            answerCommentService.GetById(req.params.anscom_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo comment
    routerAnswerComment.get("/getbycomment/:comment_id", function(req, res) {
        try {
            answerCommentService.GetByCommentId(req.params.comment_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo email hoặc name
    // /getbyperson?keyword=...
    routerAnswerComment.get("/getbyperson", function(req, res) {
        try {
            answerCommentService.GetByEmailOrName(req.query.keyword, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerAnswerComment.post("/create", function(req, res) {
        var body = req.body;
        body.anscom_date = moment(new Date()).tz(config.timezoneDefault)._d;
        answerCommentService.MapAnswerComment(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                answerCommentService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerAnswerComment.put("/update/:anscom_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.anscom_date = moment(new Date()).tz(config.timezoneDefault)._d;
        answerCommentService.MapAnswerComment(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                answerCommentService.Update(data, req.params.anscom_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin một answer_comment
    routerAnswerComment.delete("/delete/:anscom_id", auth.isJwtAuthenticated, function(req, res) {
        answerCommentService.GetById(req.params.anscom_id, function(dataFind) {
            if (dataFind) {
                answerCommentService.Delete(dataFind, req.params.anscom_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });

    //Xóa nhiều answer_comment theo comment
    routerAnswerComment.delete("deletemulti/:comment_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            answerCommentService.DeleteByComment(req.params.comment_id, function(statusCode, data) {
                return service.CreateResponse(statusCode, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

}

module.exports = ANSWERCOMMENT_CONTROLLER;