var model = require('../models'),
    service = require('../services/Infrastructure'),
    userFunctionGroupService = require('../services/UserFunctionGroupService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function USER_FUNCTION_GROUP_CONTROLLER(routerUserFunctionGroup) {
    var self = this;
    self.handleRoutes(routerUserFunctionGroup);
}

USER_FUNCTION_GROUP_CONTROLLER.prototype.handleRoutes = function(routerUserFunctionGroup) {
    // 
    routerUserFunctionGroup.get("/getfunctiongroupbyuserid/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            userFunctionGroupService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    routerUserFunctionGroup.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var value = "";
        for (var i = req.body.start; i <= req.body.end; i++) {
            if (i == req.body.end) value += " (" + req.body.user_id + "," + i + ",1)";
            else value += " (" + req.body.user_id + "," + i + ",1),";
        }
        userFunctionGroupService.MultipleAdd(value, function(statusCode, dataNew) {
            return service.CreateResponse(statusCode, res, dataNew);
        });
    });
    // /update?user_id=...&station_id=...
    routerUserFunctionGroup.put("/update", auth.isJwtAuthenticated, function(req, res) {
        var body = {
            user_id: req.query.user_id,
            function_group_id: req.query.function_group_id,
            is_active: req.query.is_active
        }
        userFunctionGroupService.MapUserFunctionGroup(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                userFunctionGroupService.Update(data, req.query.user_id, req.query.function_group_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });
    //Xóa thông tin
    routerUserFunctionGroup.delete("/delete/:user_id", auth.isJwtAuthenticated, function(req, res) {
        userFunctionGroupService.DeleteByUserID(req.params.user_id, function(statusCode, data) {
            return service.CreateResponse(statusCode, res, data);
        });
    });
}

module.exports = USER_FUNCTION_GROUP_CONTROLLER;