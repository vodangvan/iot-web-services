var model = require('../models'),
    service = require('../services/Infrastructure'),
    functionGroupService = require('../services/FunctionGroupService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function FUNCTION_GROUP_CONTROLLER(routerFunctionGroup) {
    var self = this;
    self.handleRoutes(routerFunctionGroup);
}

FUNCTION_GROUP_CONTROLLER.prototype.handleRoutes = function(routerFunctionGroup) {
    // 
    routerFunctionGroup.get("/getfunctiongroupbyid/:function_group_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            functionGroupService.GetById(req.params.function_group_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    routerFunctionGroup.get("/getidbyrole/:role", auth.isJwtAuthenticated, function(req, res) {
        try {
            functionGroupService.GetIdByRole(req.params.role, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
}

module.exports = FUNCTION_GROUP_CONTROLLER;