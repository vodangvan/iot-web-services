var model = require('../models'),
    service = require('../services/Infrastructure'),
    userFunctionService = require('../services/UserFunctionService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function USERFUNCTION_CONTROLLER(routerUserFunction) {
    var self = this;
    self.handleRoutes(routerUserFunction);
}

USERFUNCTION_CONTROLLER.prototype.handleRoutes = function(routerUserFunction) {
    // 
    routerUserFunction.get("/getfunctionbyuserid/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            userFunctionService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    routerUserFunction.get("/getfunctionbytag/:user_id/:tag", auth.isJwtAuthenticated, function(req, res) {
        try {
            userFunctionService.GetByTag(req.params.user_id, req.params.tag, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });


    routerUserFunction.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var value = "";
        for (var i = req.body.start; i <= req.body.end; i++) {
            if (i == req.body.end) value += " (" + req.body.user_id + "," + i + ",1)";
            else value += " (" + req.body.user_id + "," + i + ",1),";
        }
        userFunctionService.MultipleAdd(value, function(statusCode, dataNew) {
            return service.CreateResponse(statusCode, res, dataNew);
        });
    });
    // /update?user_id=...&station_id=...
    routerUserFunction.put("/update", auth.isJwtAuthenticated, function(req, res) {
        var body = {
            user_id: req.query.user_id,
            function_id: req.query.function_id,
            isactive: req.query.isactive
        }
        userFunctionService.MapUserFunction(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                userFunctionService.Update(data, req.query.user_id, req.query.function_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerUserFunction.delete("/delete/:user_id", auth.isJwtAuthenticated, function(req, res) {
        userFunctionService.DeleteByUserID(req.params.user_id, function(statusCode, data) {
            return service.CreateResponse(statusCode, res, data);
        });
    });

}

module.exports = USERFUNCTION_CONTROLLER;