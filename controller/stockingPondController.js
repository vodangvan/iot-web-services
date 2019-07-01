var model = require('../models'),
    service = require('../services/Infrastructure'),
    stockingPondService = require('../services/StockingPondService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function STOCKINGPOND_CONTROLLER(routerStockingPond) {
    var self = this;
    self.handleRoutes(routerStockingPond);
}

STOCKINGPOND_CONTROLLER.prototype.handleRoutes = function(routerStockingPond) {
    var self = this;
    //Lấy danh sách
    routerStockingPond.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingPondService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    /*
        //Lấy danh sách có phân trang theo user_id
        //Truyền vào các tham số           
            stocking_id: đợt thả nuôi truyền theo dạng params
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo tên trạm (station_name)
            3 biến trên truyền theo dạng query
        url: /getpagination/:stocking_id?page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerStockingPond.get("/getpagination/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            stockingPondService.GetAllByKeyword(req.params.stocking_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin chi tiết
    // /getdetail?stocking_id=...&pond_id=...
    routerStockingPond.get("/getdetail", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            stockingPondService.GetDetail(params.stocking_id, params.pond_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo stocking_id
    routerStockingPond.get("/getbystocking/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingPondService.GetByStockingId(req.params.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo pond_id
    routerStockingPond.get("/getbypond/:pond_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingPondService.GetByPondId(req.params.pond_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerStockingPond.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        if (body.stockpond_date)
            body.stockpond_date = moment(new Date(body.stockpond_date)).tz(config.timezoneDefault)._d;
        else
            body.stockpond_date = moment(new Date()).tz(config.timezoneDefault)._d;
        stockingPondService.MapStockingPond(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stockingPondService.Add(data, function(statusCode, dataNew) {
                    //Update lại trạng thái của các đợt thả nuôi trước đó của ao thành đã kết thúc 
                    stockingPondService.UpdateState(data.pond_id, function(result) {
                        return service.CreateResponse(statusCode, res, dataNew);
                    });
                });
            }
        });
    });

    //Cập nhật thông tin 
    // /update?stocking_id=...&pond_id=...
    routerStockingPond.put("/update", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        var params = req.query;
        if (body.stockpond_date)
            body.stockpond_date = moment(new Date(body.stockpond_date)).tz(config.timezoneDefault)._d;
        else
            body.stockpond_date = moment(new Date()).tz(config.timezoneDefault)._d;
        stockingPondService.MapStockingPond(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stockingPondService.Update(data, params.stocking_id, params.pond_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    // /delete?stocking_id=...&pond_id=...
    routerStockingPond.delete("/delete", auth.isJwtAuthenticated, function(req, res) {
        var params = req.query;
        stockingPondService.GetDetail(params.stocking_id, params.pond_id, function(dataFind) {
            if (dataFind) {
                stockingPondService.Delete(dataFind, params.stocking_id, params.pond_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = STOCKINGPOND_CONTROLLER;