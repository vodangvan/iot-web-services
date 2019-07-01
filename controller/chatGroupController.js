var model = require('../models'),
    service = require('../services/Infrastructure'),
    chatGroupService = require('../services/ChatGroupService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config.json')[env];

function CHAT_GROUP_CONTROLLER(routerChatGroup) {
    var self = this;
    self.handleRoutes(routerChatGroup);
}

CHAT_GROUP_CONTROLLER.prototype.handleRoutes = function(routerChatGroup) {
    var self = this;
    //Lấy danh sách
    routerChatGroup.get("/getallbyuserid/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            chatGroupService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách thành viên của chat group
    routerChatGroup.get("/getallmember/:chat_group_id", function(req, res) {
        try {
            chatGroupService.GetMemberList(req.params.chat_group_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    // routerThread.get("/getbyid/:thread_id", function(req, res) {
    //     try {
    //         threadService.GetById(req.params.thread_id, function(data) {
    //             return service.CreateResponse(HttpStatus.OK, res, data);
    //         });
    //     } catch (error) {
    //         return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
    //     }
    // });

    //Lấy danh sách theo category
    // routerThread.get("/getbypostcategory/:postcate_id", function(req, res) {
    //     try {
    //         postService.GetByPostCategoryId(req.params.postcate_id, function(data) {
    //             return service.CreateResponse(HttpStatus.OK, res, data);
    //         });
    //     } catch (error) {
    //         return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
    //     }
    // });

    //Lấy danh sách theo user
    routerChatGroup.get("/getbyuser/:user_id", function(req, res) {
        try {
            chatGroupServiceService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerChatGroup.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        chatGroupService.MapChatGroup(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                chatGroupService.Add(data, body.user_id, function(statusCode, dataNew) {
                    var members = body.chatgroup_members.split(",");
                    members.forEach(element => {
                        chatGroupService.AddMember(dataNew.chatgroup_id, element);
                    });
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    routerChatGroup.post("/createmember", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;

        chatGroupService.AddMember(body.chatgroup_id, body.user_id, function(statusCode, dataNew) {
            return service.CreateResponse(statusCode, res, dataNew);
        });
    });

    // //Cập nhật thông tin 
    // routerThread.put("/update/:post_id", auth.isJwtAuthenticated, function(req, res) {
    //     var body = req.body;
    //     body.post_updateDate = moment(new Date()).tz(config.timezoneDefault)._d;
    //     postService.MapPost(body, function(statusCode, data) {
    //         if (statusCode == HttpStatus.BAD_REQUEST)
    //             return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
    //         else {
    //             postService.Update(data, req.params.post_id, function(statusCode, dataNew) {
    //                 return service.CreateResponse(statusCode, res, dataNew);
    //             });
    //         }
    //     });
    // });

    // //Xóa thông tin 
    // routerThread.delete("/delete/:post_id", auth.isJwtAuthenticated, function(req, res) {
    //     postService.GetById(req.params.post_id, function(dataFind) {
    //         if (dataFind) {
    //             postService.Delete(dataFind, req.params.post_id, function(statusCode, data) {
    //                 return service.CreateResponse(statusCode, res, data)
    //             });
    //         } else {
    //             return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
    //         }
    //     });
    // });


}

module.exports = CHAT_GROUP_CONTROLLER;