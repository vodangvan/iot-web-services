var service = require('../services/Infrastructure'),
    locationManagerService = require('../services/LocationManagerService'),
    userService = require('../services/UserService'),
    locationService = require('../services/LocationService'),
    regionService = require('../services/RegionService'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    HttpStatus = require('http-status-codes'),
    config = require('../config/config.json')[env];

function LOCATIONMANAGER_CONTROLLER(routerLocationManager) {
    var self = this;
    self.handleRoutes(routerLocationManager);
}

LOCATIONMANAGER_CONTROLLER.prototype.handleRoutes = function(routerLocationManager) {
    var self = this;

    //Lấy danh sách quản lý theo người dùng
    routerLocationManager.get("/getlistbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        var dataResult = {
            data: [],
            typeLocation: ""
        };
        userService.GetById(req.params.user_id, function(data) {
            if (data) {
                locationManagerService.GetByUser(data, function(dataArray) {
                    var itemsProcessed = 0;
                    if (data.user_levelManager == 1) {
                        dataResult.typeLocation = 'Province';
                        dataArray.forEach(function(item) {
                            locationService.GetProvinceById(item.locaman_locationId, function(dataLocation) {
                                itemsProcessed += 1;
                                dataResult.data.push(dataLocation);
                                if (itemsProcessed == dataArray.length)
                                    return service.CreateResponse(HttpStatus.OK, res, dataResult);
                            });
                        });
                    } else if (data.user_levelManager == 2) {
                        dataResult.typeLocation = 'District';
                        dataArray.forEach(function(item) {
                            locationService.GetDistrictById(item.locaman_locationId, function(dataLocation) {
                                itemsProcessed += 1;
                                dataResult.data.push(dataLocation);
                                if (itemsProcessed == dataArray.length)
                                    return service.CreateResponse(HttpStatus.OK, res, dataResult);
                            });
                        });
                    } else if (data.user_levelManager == 3) {
                        dataResult.typeLocation = 'Ward';
                        dataArray.forEach(function(item) {
                            locationService.GetWardById(item.locaman_locationId, function(dataLocation) {
                                itemsProcessed += 1;
                                dataResult.data.push(dataLocation);
                                if (itemsProcessed == dataArray.length)
                                    return service.CreateResponse(HttpStatus.OK, res, dataResult);
                            });
                        });
                    } else if (data.user_levelManager == 4) {
                        dataResult.typeLocation = 'Region';
                        dataArray.forEach(function(item) {
                            regionService.GetById(parseInt(item.locaman_locationId), function(dataLocation) {
                                itemsProcessed += 1;
                                dataResult.data.push(dataLocation);
                                if (itemsProcessed == dataArray.length)
                                    return service.CreateResponse(HttpStatus.OK, res, dataResult);
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

    //Thêm mới thông tin quản lý
    routerLocationManager.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.locaman_endDate = null;
        locationManagerService.MapLocationManager(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST) {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            } else {
                locationManagerService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerLocationManager.put("/update/:locaman_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        locationManagerService.MapLocationManager(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                locationManagerService.Update(data, parseInt(req.params.locaman_id), function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });

    });
    //Xóa một khu vực quản lý của người dùng
    //Là cập nhật ngày kết thúc
    routerLocationManager.put("/removemanager/:locaman_id", auth.isJwtAuthenticated, function(req, res) {
        var locaman_endDate = moment(new Date()).tz(config.timezoneDefault)._d;
        locationManagerService.RemoveManager(locaman_endDate, req.params.locaman_id, function(statusCode, data) {
            return service.CreateResponse(statusCode, res, data);
        });
    });

}

module.exports = LOCATIONMANAGER_CONTROLLER;