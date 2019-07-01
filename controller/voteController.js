var model = require('../models'),
    service = require('../services/Infrastructure'),
    voteService = require('../services/VoteService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    userService = require('../services/UserService'),
    config = require('../config/config.json')[env];
var socketService = require('../services/Socket');

function VOTE_CONTROLLER(routerVote) {
    var self = this;
    self.handleRoutes(routerVote);
}

VOTE_CONTROLLER.prototype.handleRoutes = function(routerVote) {
    var self = this;
    routerVote.get("/getallbythread/:thread_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            voteService.GetByThreadId(req.params.thread_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);

            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    routerVote.get("/getallbyreply/:reply_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            voteService.GetByThreadId(req.params.reply_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    routerVote.get("/getthreadvotestate/:user_id/:thread_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            voteService.GetByThreadId(req.params.user_id, req.params.thread_id, function(data) {
                if (data) {
                    return service.CreateResponse(HttpStatus.OK, res, { voted: true });
                } else {
                    return service.CreateResponse(HttpStatus.OK, res, { voted: false });
                }
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    routerVote.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var io = res.io;
        var body = req.body;
        body.vote_time = moment(new Date()).tz(config.timezoneDefault)._d;
        voteService.MapVote(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                voteService.AddThreadVote(data, function(statusCode1, dataNew) {
                    if (statusCode1 == HttpStatus.BAD_REQUEST) {
                        return service.CreateResponse(statusCode1, res, dataNew);
                    } else {
                        model.user.findOne({
                            where: {
                                user_id: data.user_id
                            },
                            attributes: ['user_id', 'user_fullName', 'user_userName']
                        }).then(function(user) {
                            socketService.SendNewReplyToUser(io, dataNew.threadCreatorId, { "message": user.user_fullName + " vừa thích bài đăng của bạn.", "thread_id": body.thread_id });
                            socketService.SendNewReplyToThread(io, { "type": "vote", "thread_id": dataNew.thread_id, "voteCount": dataNew.voteCount });
                            return service.CreateResponse(statusCode, res, dataNew.voteCount);
                        })
                    }
                });
            }
        });
    });

    // routerVote.post("/createreplyvote", auth.isJwtAuthenticated, function(req, res) {
    //     var body = req.body;
    //     body.vote_time = moment(new Date()).tz(config.timezoneDefault)._d;
    //     voteService.MapVote(body, function(statusCode, data) {
    //         if (statusCode == HttpStatus.BAD_REQUEST)
    //             return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
    //         else {
    //             voteService.AddReplyVote(data, function(statusCode, dataNew) {
    //                 return service.CreateResponse(statusCode, res, dataNew);
    //             });
    //         }
    //     });
    // });

    // //Xóa thông tin 
    routerVote.post("/delete/", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        var io = res.io;
        voteService.GetByThreadId(body.user_id, body.thread_id, function(dataFind) {
            if (dataFind) {
                voteService.Delete(dataFind, dataFind.vote_id, function(statusCode, data) {
                    if (statusCode == HttpStatus.BAD_REQUEST) {
                        return service.CreateResponse(statusCode, res, data)
                    } else {
                        socketService.SendNewReplyToThread(io, { "type": "vote", "thread_id": dataFind.thread_id, "voteCount": data.voteCount });
                        return service.CreateResponse(statusCode, res, data.voteCount)

                    }
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });
}

module.exports = VOTE_CONTROLLER;