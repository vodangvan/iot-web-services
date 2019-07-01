var model = require('../models'),
    service = require('../services/Infrastructure'),
    userService = require('../services/UserService'),
    locationService = require('../services/LocationService'),
    regionService = require('../services/RegionService'),
    locationManagerService = require('../services/LocationManagerService'),
    pondService = require('../services/PondService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];

function REGION_CONTROLLER(routerRegion) {
    var self = this;
    self.handleRoutes(routerRegion);
}

REGION_CONTROLLER.prototype.handleRoutes = function(routerRegion) {
    var self = this;
    //Lấy toàn bộ danh sách vùng/khu vực
    /*routerRegion.get("/getall", auth.isJwtAuthenticated, function(req, res){
        try {
            regionService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });*/

    /*
        //Lấy danh sách có phân trang theo user_id
        //Truyền vào các tham số
            user_id: là id của người dùng, truyền dạng params
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo tên vùng (region_name)
            3 biến trên truyền theo dạng query
        url: /getpagination/:user_id?page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerRegion.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        var arrLevel = [1, 2, 3, 4];
        var arrRegionId = [];
        var params = req.query;
        var page = params.page;
        var pageSize = params.pageSize || config.pageSizeDefault;
        try {
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    if (arrLevel.indexOf(dataUser.dataValues.user_levelManager) >= 0) { //Kiểm tra có phải là người quản lý
                        locationManagerService.GetListIDByUser(dataUser, function(dataArray) {
                            locationService.GetListRegionManager(dataArray, dataUser.user_levelManager, params.keyword, page, pageSize).then(function(dataRegion) {
                                service.PaginationSet(dataRegion, dataRegion.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                                });
                            });
                        });
                    } else if (arrLevel.indexOf(dataUser.user_levelManager) == -1) {
                        regionService.GetListByUserAndPond(req.params.user_id, params.keyword, page, pageSize).then(function(dataRegion) {
                            service.PaginationSet(dataRegion, dataRegion.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                                return service.CreateResponse(HttpStatus.OK, res, dataNew);
                            });
                        });
                    }
                } else {
                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                }
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo id
    routerRegion.get("/getbyid/:region_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            regionService.GetById(req.params.region_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách khu vực theo xã/phường
    routerRegion.get("/getlistbyward/:ward_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            regionService.GetByWardId(req.params.ward_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách region theo user_id
    routerRegion.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        var arrLevel = [1, 2, 3, 4];
        var arrRegionId = [];
        try {
            userService.GetById(req.params.user_id, function(dataUser) {
                if (dataUser) {
                    if (arrLevel.indexOf(dataUser.dataValues.user_levelManager) >= 0) { //Kiểm tra có phải là người quản lý
                        locationManagerService.GetListIDByUser(dataUser, function(dataArray) {
                            locationService.GetListRegionManager(dataArray, dataUser.user_levelManager, '', 0, -1).then(function(dataRegion) {
                                return service.CreateResponse(HttpStatus.OK, res, dataRegion);
                            });
                        });
                    } else if (arrLevel.indexOf(dataUser.user_levelManager) == -1) {
                        regionService.GetListByUserAndPond(req.params.user_id, '', 0, -1).then(function(dataRegion) {
                            return service.CreateResponse(HttpStatus.OK, res, dataRegion);
                        });
                    }
                } else {
                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                }
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách người quản lý khu vực
    routerRegion.get("/getlistmanager/:region_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            regionService.GetListManager(req.params.region_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách khu vực quản lý bởi user
    routerRegion.get("/getlistregionmanager/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            regionService.GetListManagerRegion(req.params.user_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới khu vực
    routerRegion.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        regionService.MapRegion(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                regionService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });
    //Thêm người quản lý khu vực
    //Giá trị nhận vào là mảng Region_Managers chứa các user_id
    routerRegion.post("/regionmanager/:region_id", auth.isJwtAuthenticated, function(req, res) {
        var region_manager = [];
        region_manager = req.body.Region_Managers;
        var data = {
            arr: [],
            affectedRows: 0
        };
        regionService.DeleteRegionManage(req.params.region_id, function(statusCode, flag) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, flag);
            region_manager.forEach(function(item) {
                regionService.MapRegionManager({
                    region_id: req.params.region_id,
                    user_id: item
                }, function(statusCode, dataManager) {
                    if (statusCode == HttpStatus.BAD_REQUEST)
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, dataManager);
                    else {
                        regionService.AddManager(dataManager, function(statusCode, dataNew) {
                            if (statusCode == HttpStatus.CREATED) {
                                data.affectedRows += 1;
                                data.arr.push(dataNew);
                            };
                            if (data.affectedRows == region_manager.length)
                                return service.CreateResponse(HttpStatus.CREATED, res, data.arr);
                        });
                    };
                });
            });
        });
    });

    //Cập nhật thông tin
    routerRegion.put("/update/:region_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        regionService.MapRegion(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                regionService.Update(data, req.params.region_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });

    });
    //Xóa khu vực
    routerRegion.delete("/delete/:region_id", auth.isJwtAuthenticated, function(req, res) {
        regionService.GetById(req.params.region_id, function(dataFind) {
            if (dataFind) {
                regionService.Delete(dataFind, req.params.region_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });

}

module.exports = REGION_CONTROLLER;