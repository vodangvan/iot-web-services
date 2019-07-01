var model = require('../models'),
    service = require('../services/Infrastructure'),
    otherService = require('../services/OtherService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    billService = require('../services/BillService'),
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function OTHER_CONTROLLER(routerOther) {
    var self = this;
    self.handleRoutes(routerOther);
}

OTHER_CONTROLLER.prototype.handleRoutes = function(routerOther) {
    var self = this;
    //Lấy danh sách
    /*routerOther.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            otherService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerOther.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            otherService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerOther.get("/getbyid/:other_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            otherService.GetById(req.params.other_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo bill_id
    routerOther.get("/getbybill/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            otherService.GetByBillId(req.params.bill_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerOther.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        otherService.MapOther(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                otherService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    /*
        //Thêm mới nhiều other cho một bill
        - Dùng để thêm mới danh sách các other vào một bill
        - Nhận bill_id theo dạng params
        - Nhận vào id của bill và danh sách các other truyền qua body theo dạng đối tượng
        {
            bill_id: ...,
            others: [
                {
                    other_name: ...,
                    other_price: ...,
                    other_quantity: ...,
                    other_note: ...
                },
                {...},
                {...}
            ]
        }
    */
    routerOther.post("/createmulti/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        billService.GetById(req.params.bill_id, function(billData) {
            if (billData && body.others) {
                otherService.MapOtherArray(body, function(statusCode, arrData) {
                    if (statusCode == HttpStatus.OK) {
                        otherService.AddMulti(arrData, function(statusCode2, data) {
                            return service.CreateResponse(statusCode2, res, data);
                        });
                    } else {
                        return service.CreateResponse(statusCode, res, arrData);
                    }
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
            }
        });
    });

    //Cập nhật thông tin 
    routerOther.put("/update/:other_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        otherService.MapOther(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                otherService.Update(data, req.params.other_id, function(statusCode, dataNew) {
                    if (statusCode == HttpStatus.OK) {
                        billService.UpdateTotal(body.bill_id, function(statusCode3, dataTotal) {});
                    }
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerOther.delete("/delete/:other_id", auth.isJwtAuthenticated, function(req, res) {
        otherService.GetById(req.params.other_id, function(dataFind) {
            if (dataFind) {
                otherService.Delete(dataFind, req.params.other_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = OTHER_CONTROLLER;