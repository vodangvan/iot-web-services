var model = require('../models'),
    service = require('../services/Infrastructure'),
    messageService = require('../services/MessageService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    socketService = require('../services/Socket'),
    config = require('../config/config.json')[env];

function MESSAGE_CONTROLLER(routerMessage) {
    var self = this;
    self.handleRoutes(routerMessage);
}

MESSAGE_CONTROLLER.prototype.handleRoutes = function(routerMessage) {
    var self = this;

    routerMessage.get("/getpagination/:conversation_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            messageService.GetByConversationId(req.params.conversation_id, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    })

    // //Thêm mới tin nhắn
    routerMessage.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var io = res.io;
        var body = req.body;
        console.log(body);
        body.message_time = moment(new Date()).tz(config.timezoneDefault)._d;
        messageService.MapMessage(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                messageService.Add(data, function(statusCode1, dataNew) {
                    data.user_fullName = body.user_fullName;
                    if (body.isSingleChat == 'true') {
                        socketService.SendMessageToClient(io, body.receiver_id, data, function(data1) {
                            socketService.SendMessageToClient(io, body.user_id, data, function(data2) {
                                return service.CreateResponse(statusCode, res, dataNew);
                            });
                        });
                    } else {
                        model.sequelize.query("SELECT `user_id` FROM  `chat_group_member` WHERE `chatgroup_id` = " + body.receiver_id, { type: model.sequelize.QueryTypes.SELECT }).then(function(memberList) {
                            memberList.forEach(element => {
                                socketService.SendMessageToClient(io, element.user_id, data, function(loi) {});
                            });
                            return service.CreateResponse(statusCode1, res, dataNew);
                        });
                    }
                });
            }
        });
    });

    routerMessage.put("/update/:message_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        messageService.MapMessage(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                messageService.Update(data, req.params.message_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        })
    });

    routerMessage.delete("/delete/:message_id", auth.isJwtAuthenticated, function(req, res) {
        messageService.GetByMessageId(req.params.message_id, function(dataFind) {
            if (dataFind) {
                messageService.Delete(dataFind, req.params.message_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, dataFind)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });
}

module.exports = MESSAGE_CONTROLLER;