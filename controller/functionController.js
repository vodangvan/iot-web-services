var model = require('../models'),
    service = require('../services/Infrastructure'),
    functionService = require('../services/FunctionService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function FUNCTION_CONTROLLER(routerfunction) {
    var self = this;
    self.handleRoutes(routerfunction);
}

FUNCTION_CONTROLLER.prototype.handleRoutes = function(routerfunction) {
    // 
    routerfunction.get("/getfuncbyid/:func_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            functionService.GetById(req.params.func_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    // 
    routerfunction.get("/getidbyrole/:rolename", auth.isJwtAuthenticated, function(req, res) {
        try {
            functionService.GetIdByRole(req.params.rolename, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
}



module.exports = FUNCTION_CONTROLLER;