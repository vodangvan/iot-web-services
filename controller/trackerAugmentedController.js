var model = require('../models'),
    service = require('../services/Infrastructure'),
    trackerAugmentedService = require('../services/TrackerAugmentedService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];

function TRACKERAUGMENTED_CONTROLLER(routerTrackerAugmented) {
    var self = this;
    self.handleRoutes(routerTrackerAugmented);
}

TRACKERAUGMENTED_CONTROLLER.prototype.handleRoutes = function(routerTrackerAugmented) {
    var self = this;
    //Lấy danh sách các
    /*routerTrackerAugmented.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            trackerAugmentedService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    // /api/trackeraugmented/getpagination?stocking_id=….&pond_id=…&page=….&pageSize=….&keyword=…
    routerTrackerAugmented.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            trackerAugmentedService.GetAllByKeyword(params.stocking_id, params.pond_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerTrackerAugmented.get("/getbyid/:trackeraugmented_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            trackerAugmentedService.GetById(req.params.trackeraugmented_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo stocking_id và pond_id
    //Lấy về danh sách theo dõi tăng trưởng của một ao tại đợt thả nuôi
    // /getbystockingpond?pond_id=...&stocking_id=...
    routerTrackerAugmented.get("/getbystockingpond", auth.isJwtAuthenticated, function(req, res) {
        try {
            trackerAugmentedService.GetByPondAndStocking(req.query.pond_id, req.query.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy vể số lần theo dõi lớn nhất của một ao
    //Trả về là một số: trackeraugmented_number
    // /getbymaxnumber?pond_id=...&stocking_id=...
    routerTrackerAugmented.get("/getbymaxnumber", auth.isJwtAuthenticated, function(req, res) {
        try {
            trackerAugmentedService.GetByMaxNumberForStockingPond(req.query.pond_id, req.query.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Kiểm tra số thự tự lần theo dõi có tồn tại hay ko
    // /checkexitsnumber?pond_id=...&stocking_id=...&trackeraugmented_number=...
    routerTrackerAugmented.get("/checkexitsnumber", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            trackerAugmentedService.CheckExitsNumberNew(params.pond_id, params.stocking_id, params.trackeraugmented_number, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerTrackerAugmented.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        trackerAugmentedService.MapTrackerAugmented(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                trackerAugmentedService.CheckExitsNumberNew(data.pond_id, data.stocking_id, data.trackeraugmented_number, function(flag) {
                    if (!flag) {
                        trackerAugmentedService.Add(data, function(statusCode, dataNew) {
                            return service.CreateResponse(statusCode, res, dataNew);
                        });
                    } else {
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.numberExits);
                    }
                });
            }
        });
    });

    //Cập nhật thông tin
    routerTrackerAugmented.put("/update/:trackeraugmented_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        trackerAugmentedService.MapTrackerAugmented(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                trackerAugmentedService.CheckExitsNumberOld(req.params.trackeraugmented_id, data.pond_id, data.trackeraugmented_number, function(flag) {
                    if (!flag) {
                        trackerAugmentedService.Update(data, req.params.trackeraugmented_id, function(statusCode, dataNew) {
                            return service.CreateResponse(statusCode, res, dataNew);
                        });
                    } else {
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.numberExits);
                    }
                });
            }
        });
    });

    //Xóa thông tin
    routerTrackerAugmented.delete("/delete/:trackeraugmented_id", auth.isJwtAuthenticated, function(req, res) {
        trackerAugmentedService.GetById(req.params.trackeraugmented_id, function(dataFind) {
            if (dataFind) {
                trackerAugmentedService.Delete(dataFind, req.params.trackeraugmented_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = TRACKERAUGMENTED_CONTROLLER;