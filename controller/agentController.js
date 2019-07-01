var model = require('../models'),
    service = require('../services/Infrastructure'),
    agentService = require('../services/AgentService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function AGENT_CONTROLLER(routerAgent) {
    var self = this;
    self.handleRoutes(routerAgent);
}

AGENT_CONTROLLER.prototype.handleRoutes = function(routerAgent) {
    var self = this;
    //Lấy danh sách các loại tuổi nuôi
    routerAgent.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            agentService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerAgent.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            agentService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm loại tuổi theo ID
    routerAgent.get("/getbyid/:agent_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            agentService.GetById(req.params.agent_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Tìm theo mã bệnh
    routerAgent.get("/getbysickid/:sick_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            agentService.GetBySickId(req.params.sick_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Thêm mới thông tin loại tuổi
    routerAgent.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        agentService.MapAgent(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                agentService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loại tuổi
    routerAgent.put("/update/:agent_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        agentService.MapAgent(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                agentService.Update(data, req.params.agent_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loại tuổi
    routerAgent.delete("/delete/:agent_id", auth.isJwtAuthenticated, function(req, res) {
        agentService.GetById(req.params.agent_id, function(dataFind) {
            if (dataFind) {
                agentService.Delete(dataFind, req.params.agent_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = AGENT_CONTROLLER;