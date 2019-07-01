var model = require('../models'),
    service = require('../services/Infrastructure'),
    friendService = require('../services/FriendService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];

function FRIEND_CONTROLLER(routerFriend) {
    var self = this;
    self.handleRoutes(routerFriend);
}

//Router chuyen huong de goi service truy xuat danh sach ban
//URI: /api/friend/getfriendlist/:user_id (id cua nguoi dung can lay danh sach ban)
FRIEND_CONTROLLER.prototype.handleRoutes = function(routerFriend) {
    var self = this;

    routerFriend.get("/getfriendlist/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            friendService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            console.log(error);
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    routerFriend.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        friendService.MapFriend(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST) {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            } else {
                friendService.Add(data.data1, function(statusCode, dataNew1) {
                    friendService.Add(data.data2, function(statusCode, data) {
                        return service.CreateResponse(HttpStatus.OK, res, data);
                    })
                })
            }
        })
    });

    routerFriend.delete("/delete/:user_id/:user_friendUserId", auth.isJwtAuthenticated, function(req, res) {
        try {
            friendService.Delete(req.params.user_id, req.params.userFriendUserId, function(statusCode, data) {
                return service.CreateResponse(statusCode, data);
            })
        } catch (err) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, err);
        }
    })
}

module.exports = FRIEND_CONTROLLER;