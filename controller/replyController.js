var model = require('../models'),
    service = require('../services/Infrastructure'),
    replyService = require('../services/ReplyService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    socketService = require('../services/Socket'),
    config = require('../config/config.json')[env];


function REPLY_CONTROLLER(routerReply) {
    var self = this;
    self.handleRoutes(routerReply);
}

REPLY_CONTROLLER.prototype.handleRoutes = function(routerReply) {
    var self = this;

    //Lay reply theo bai post
    routerReply.get("/getbythread/:thread_id", function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            replyService.GetByThread(req.params.thread_id, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    // //Thêm mới thông tin
    routerReply.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        var io = res.io;
        let time = moment(new Date()).tz(config.timezoneDefault)._d;
        body.reply_time = time;
        body.reply_lastEdit = time;
        body.reply_votes = 0;
        body.reply_index = 0;
        replyService.MapReply(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                replyService.Add(data, function(statusCode, dataNew) {
                    socketService.SendNewReplyToThread(io, { "type": "reply", "thread_id": dataNew.thread_id });
                    replyService.GetById(dataNew.reply_id, function(newReply) {
                        socketService.SendNewReplyToUser(io, dataNew.threadCreatorId, { "message": newReply.user_fullName + " vừa trả lời bài đăng của bạn.", "thread_id": body.thread_id });
                        return service.CreateResponse(statusCode, res, dataNew);
                    })
                });
            }
        });
    });

    // //Cập nhật thông tin 
    routerReply.put("/update/:reply_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.reply_lastEdit = moment(new Date()).tz(config.timezoneDefault)._d;
        replyService.MapReply(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                replyService.Update(data, req.params.reply_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    // //Xóa thông tin 
    routerReply.delete("/delete/:reply_id", auth.isJwtAuthenticated, function(req, res) {
        replyService.GetById(req.params.reply_id, function(dataFind) {
            if (dataFind) {
                replyService.Delete(dataFind, req.params.reply_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = REPLY_CONTROLLER;