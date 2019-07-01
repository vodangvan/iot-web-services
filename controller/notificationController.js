var model = require('../models'),
    service = require('../services/Infrastructure'),
    notificationService = require('../services/NotificationService'),
    locationManagerService = require('../services/LocationManagerService'),
    userService = require('../services/UserService'),
    locationService = require('../services/LocationService'),
    regionService = require('../services/RegionService'),
    messageConfig = require('../config/messageConfig.json'),
    notificationStateService = require('../services/NotificationStateService'),
    pondService = require('../services/PondService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    moment = require('moment'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config.json')[env];


function NOTIFICATION_CONTROLLER(routerNotification) {
    var self = this;
    self.handleRoutes(routerNotification);
}

NOTIFICATION_CONTROLLER.prototype.handleRoutes = function(routerNotification) {
    var self = this;
    //Lấy danh sách tất cả thông báo
    /*routerNotification.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            notificationService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerNotification.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var pageSize = params.pageSize || config.pageSizeDefault;
            var page = params.page;
            notificationService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin của một thông báo theo notif_id thông báo
    //Truyền vào là user_id và notif_id
    // getbyid?user_id=...&notif_id=...
    routerNotification.get("/getbyid", auth.isJwtAuthenticated, function(req, res) {
        try {
            notificationService.GetById(req.query.notif_id, function(data) {
                if (data) {
                    notificationStateService.CheckState(req.query.notif_id, req.query.user_id, function(state) {
                        if (state) {
                            return service.CreateResponse(HttpStatus.OK, res, data);
                        } else {
                            var notifstate_readTime = moment(new Date()).tz(config.timezoneDefault)._d;
                            var objState = {
                                user_id: req.query.user_id,
                                notif_id: req.query.notif_id,
                                notifstate_readTime: notifstate_readTime
                            };
                            notificationStateService.Add(objState, function(statusCode, dataNew) {
                                if (statusCode == HttpStatus.CREATED)
                                    return service.CreateResponse(statusCode, res, data);
                                else
                                    return service.CreateResponse(statusCode, res, dataNew);
                            });
                        }
                    });
                } else {
                    return service.CreateResponse(HttpStatus.OK, res, messageConfig.objNotExist);
                }
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách thông báo cho người quản lý theo region
    //Tham số truyền vào là user_id và index là lần lấy dữ liệu, bắt đầu từ 0
    // /getbymanager/1?index=0&size=...
    routerNotification.get("/getbymanager/:user_id", auth.isJwtAuthenticated, function(req, res) {
        var arrLevel = [1, 2, 3, 4];
        var params = req.query;
        var arrRegionId = [];
        var index = params.index || 0;
        var size = params.size || 10;
        userService.GetById(req.params.user_id, function(data) {
            if (data) {
                //Lấy về một mảng các locaman_locationId theo user_id
                locationManagerService.GetListIDByUser(data, function(dataArray) {
                    if (arrLevel.indexOf(data.user_levelManager) >= 0) {
                        //Lấy ra danh sách ID và name của region quản lý
                        locationService.GetListRegionManager(dataArray, data.user_levelManager).then(function(dataRegion) {
                            dataRegion.forEach(function(region) {
                                arrRegionId.push(region.region_id);
                                if (arrRegionId.length == dataRegion.length) {
                                    //Lấy thông báo theo region_id
                                    notificationService.GetByRegionId(req.params.user_id, arrRegionId, index, size, function(dataNoti) {
                                        return service.CreateResponse(HttpStatus.OK, res, dataNoti);
                                    });
                                }
                            });
                        });
                    } else {
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.accountNotManager });
                    }
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            }
        });
    });

    //Lấy danh sách thông báo theo người dùng
    //Tham số truyền vào là user_id và index là lần lấy dữ liệu, bắt đầu từ 0
    // /getbyuser/1?index=0&size=...
    routerNotification.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var index = params.index || 0;
            var size = params.size || 10;
            pondService.GetListRegionIdByUser(req.params.user_id, function(arrData) {
                notificationService.GetByUserId(req.params.user_id, arrData, index, size, function(data) {
                    return service.CreateResponse(HttpStatus.OK, res, data);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
}

module.exports = NOTIFICATION_CONTROLLER;