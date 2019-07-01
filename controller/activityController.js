var model = require('../models'),
    service = require('../services/Infrastructure'),
    activityService = require('../services/ActivityService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function ACTIVITY_CONTROLLER(routerActivity) {
    var self = this;
    self.handleRoutes(routerActivity);
}

ACTIVITY_CONTROLLER.prototype.handleRoutes = function(routerActivity) {
    var self = this;
    //Lấy danh sách tất cả các lời khuyên
    routerActivity.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    /*
        //Lấy danh sách có phân trang theo user_id
        //Truyền vào các tham số
            user_id: là id của người dùng, truyền dạng params
            actitype_id: id của loại hoạt động
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo activity_note
            4 biến trên truyền theo dạng query
        url: /getpagination/:user_id?stocking_id=...&pond_id=...&actitype_id=...&page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerActivity.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            activityService.GetAllByKeyword(parseInt(req.params.user_id), params.stocking_id, params.pond_id, params.actitype_id, params.keyword, page, pageSize).then(function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin hoạt động theo id
    routerActivity.get("/getbyid/:activity_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityService.GetById(req.params.activity_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách hoạt động theo pond_id
    routerActivity.get("/getbypond/:pond_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityService.GetByPondId(req.params.pond_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách hoạt động theo pond_id trong khoảng thời gian
    //Truyền vào là khoảng thời gian là ngày bắt đầu và kết thúc
    // dateStart: thời gian bắt đầu
    // dateEnd: thời gian kết thúc
    // /getbypondmanager/1?actitype_id=...&dateStart=...&dateEnd=...
    routerActivity.get("/getbypondmanager/:pond_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var query = req.query;
            var dateEnd = (query.dateEnd != "" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart != "" && query.dateStart) ? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(1, 'days')._d;
            activityService.GetByPondDate(req.params.pond_id, query.actitype_id, dateStart, dateEnd, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo loại hoạt động
    routerActivity.get("/getbyactivitytype/:actitype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityService.GetByActivityTypeId(req.params.actitype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới 
    routerActivity.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        activityService.MapActivity(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                activityService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerActivity.put("/update/:activity_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        activityService.MapActivity(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                activityService.Update(data, req.params.activity_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerActivity.delete("/delete/:activity_id", auth.isJwtAuthenticated, function(req, res) {
        activityService.GetById(req.params.activity_id, function(dataFind) {
            if (dataFind) {
                activityService.Delete(dataFind, req.params.activity_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = ACTIVITY_CONTROLLER;