var model = require('../models'),
    service = require('../services/Infrastructure'),
    billService = require('../services/BillService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function BILL_CONTROLLER(routerBill) {
    var self = this;
    self.handleRoutes(routerBill);
}

BILL_CONTROLLER.prototype.handleRoutes = function(routerBill) {
    var self = this;
    //Lấy danh sách
    /*routerBill.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            billService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });
*/
    /*
        //Lấy danh sách có phân trang theo user_id
        //Truyền vào các tham số
            user_id: là id của người dùng, truyền dạng params
            stocking_id: đợt thả nuôi, nếu truyền vào 0 thì lấy tất cả theo user_id
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo tên trạm (station_name)
            4 biến trên truyền theo dạng query
        url: /getpagination/:user_id?stocking_id=...page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */

    routerBill.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            billService.GetAllByKeyword(req.params.user_id, params.stocking_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerBill.get("/getbyid/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            billService.GetById(req.params.bill_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo người dùng
    routerBill.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            billService.GetByUserId(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo stocking_id
    routerBill.get("/getbystocking/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            billService.GetByStockingId(req.params.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerBill.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.bill_createDate = moment(new Date()).tz(config.timezoneDefault)._d;
        billService.MapBill(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                billService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerBill.put("/update/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.bill_createDate = moment(new Date()).tz(config.timezoneDefault)._d;
        billService.MapBill(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                billService.Update(data, req.params.bill_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin một
    routerBill.delete("/delete/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        billService.GetById(req.params.stocking_id, function(dataFind) {
            if (dataFind) {
                billService.Delete(dataFind, req.params.bill_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = BILL_CONTROLLER;