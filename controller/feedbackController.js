var model = require('../models'),
    service = require('../services/Infrastructure'),
    feedbackService = require('../services/FeedbackService'),
    commonService = require('../services/CommonService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function FEEDBACK_CONTROLLER(routerFeedback) {
    var self = this;
    self.handleRoutes(routerFeedback);
}

FEEDBACK_CONTROLLER.prototype.handleRoutes = function(routerFeedback) {
    var self = this;
    //Lấy danh sách
    /*routerFeedback.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            feedbackService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });*/

    //Lấy danh sách có phân trang theo name hoặc email sắp xếp theo tình trạn trả lời
    routerFeedback.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            feedbackService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerFeedback.get("/getbyid/:feedback_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            feedbackService.GetById(req.params.feedback_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo user trả lời phản hồi
    routerFeedback.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            feedbackService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy số thông báo chưa trả lời: feedback_status = 0
    routerFeedback.get("/numberoffeedback", auth.isJwtAuthenticated, function(req, res) {
        try {
            feedbackService.CountFeedbackStatus(0, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Gửi phản hồi
    routerFeedback.post("/sendfeedback", function(req, res) {
        var body = req.body;
        body.feedback_createDate = moment(new Date()).tz(config.timezoneDefault)._d;
        body.feedback_status = false;
        feedbackService.MapFeedback(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                feedbackService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Trả lời phản hồi
    routerFeedback.put("/replyfeedback/:feedback_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        feedbackService.GetById(req.params.feedback_id, function(feedback) {
            if (feedback) {
                body.feedback_name = feedback.feedback_name;
                body.feedback_email = feedback.feedback_email;
                body.feedback_message = feedback.feedback_message;
                body.feedback_createDate = feedback.feedback_createDate;
                body.feedback_answerDate = moment(new Date()).tz(config.timezoneDefault)._d;
                body.feedback_status = true;
                feedbackService.MapFeedback(body, function(statusCode, data) {
                    if (statusCode == HttpStatus.BAD_REQUEST)
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
                    else {
                        feedbackService.Update(data, req.params.feedback_id, function(statusCode, dataNew) {
                            if (statusCode == HttpStatus.OK) {
                                commonService.SendEmail(dataNew.feedback_email, "Phản hồi thông tin", dataNew.feedback_answerContent, "Trả lời phản hổi từ TeamTom39");
                            }
                            return service.CreateResponse(statusCode, res, dataNew);
                        });
                    }
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
            }
        });
    });

    //Xóa thông tin
    routerFeedback.delete("/delete/:feedback_id", auth.isJwtAuthenticated, function(req, res) {
        feedbackService.GetById(req.params.feedback_id, function(dataFind) {
            if (dataFind) {
                feedbackService.Delete(dataFind, req.params.feedback_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = FEEDBACK_CONTROLLER;