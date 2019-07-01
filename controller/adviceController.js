var model = require('../models'),
    service = require('../services/Infrastructure'),
    adviceService = require('../services/AdviceService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function ADVICE_CONTROLLER(routerAdvice) {
    var self = this;
    self.handleRoutes(routerAdvice);
}

ADVICE_CONTROLLER.prototype.handleRoutes = function(routerAdvice) {
    var self = this;
    //Lấy danh sách tất cả các lời khuyên
    /* routerAdvice.get("/getall",auth.isJwtAuthenticated , function(req,res){
         try {
             adviceService.GetAll(function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
             });                    
         } catch (error) {
             return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
         }  
     });*/

    /*
        //Lấy danh sách có phân trang tất cả các lời khuyên
        //Truyền vào các tham số
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo tên trạm (station_name)
            3 biến trên truyền theo dạng query
        url: /getpagination?page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerAdvice.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            adviceService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    /*
        //Lấy danh sách có phân trang theo user_id
        //Truyền vào các tham số
            user_id: là id của người dùng, truyền dạng params
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo tên trạm (station_name)
            3 biến trên truyền theo dạng query
        url: /getpagination/:user_id?page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerAdvice.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            adviceService.GetByUserId(req.params.user_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin lời khuyên theo id
    routerAdvice.get("/getbyid/:advice_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            adviceService.GetById(req.params.advice_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách lời khuyên theo tác giả của nó user_id
    routerAdvice.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            adviceService.GetByUserId(req.params.user_id, '', 0, -1, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách lời khuyên theo ngưỡng cảnh báo threshold_id
    routerAdvice.get("/getbythreshold/:threshold_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            adviceService.GetByThresholdId(req.params.threshold_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới một lời khuyên
    routerAdvice.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        body.data_createdDate = body.data_createdDate._d;
        adviceService.MapAdvice(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                adviceService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin một lời khuyên
    routerAdvice.put("/update/:advice_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        body.data_createdDate = body.data_createdDate._d;
        adviceService.MapAdvice(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                adviceService.Update(data, req.params.advice_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin một lời khuyên
    routerAdvice.delete("/delete/:advice_id", auth.isJwtAuthenticated, function(req, res) {
        adviceService.GetById(req.params.advice_id, function(dataFind) {
            if (dataFind) {
                adviceService.Delete(dataFind, req.params.advice_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = ADVICE_CONTROLLER;