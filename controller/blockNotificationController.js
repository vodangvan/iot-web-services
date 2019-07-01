var model = require('../models'),
    service = require('../services/Infrastructure'),
    blockNotificationService = require('../services/BlockNotificationService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function BLOCKNOTIFICATION_CONTROLLER(routerBlockNotification) {
    var self = this;
    self.handleRoutes(routerBlockNotification);
}

BLOCKNOTIFICATION_CONTROLLER.prototype.handleRoutes = function(routerBlockNotification) {
    var self = this;
    //Lấy danh sách
    /*routerBlockNotification.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            blockNotificationService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerBlockNotification.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            blockNotificationService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy chi tiết 1 dữ liệu
    // /getbyid?user_id=...&station_id=...
    routerBlockNotification.get("/getbyid", auth.isJwtAuthenticated, function(req, res) {
        try {
            blockNotificationService.GetById(req.query.station_id, req.query.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo user
    routerBlockNotification.get("/getlistbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            blockNotificationService.GetListByUser(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo station
    routerBlockNotification.get("/getlistbystation/:station_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            blockNotificationService.GetListByStation(req.params.station_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    // /blocknotification/create?user_id=...&station_id=...
    routerBlockNotification.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = {
            user_id: req.query.user_id,
            station_id: req.query.station_id
        };
        blockNotificationService.MapBlockNotification(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                blockNotificationService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    // /delete?user_id=...&station_id=...
    routerBlockNotification.delete("/delete", auth.isJwtAuthenticated, function(req, res) {
        blockNotificationService.GetById(req.query.station_id, req.query.user_id, function(dataFind) {
            if (dataFind) {
                blockNotificationService.Delete(dataFind, req.query.station_id, req.query.user_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data);
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = BLOCKNOTIFICATION_CONTROLLER;