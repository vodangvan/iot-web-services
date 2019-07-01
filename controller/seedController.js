var model = require('../models'),
    service = require('../services/Infrastructure'),
    seedService = require('../services/SeedService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    billService = require('../services/BillService'),
    moment = require('moment'),
    config = require('../config/config.json')[env];

function SEED_CONTROLLER(routerSeed) {
    var self = this;
    self.handleRoutes(routerSeed);
}

SEED_CONTROLLER.prototype.handleRoutes = function(routerSeed) {
    var self = this;
    //Lấy danh sách các
    routerSeed.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            seedService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    /*
        //Lấy danh sách có phân trang theo user_id hoặc stocking_id
        //Truyền vào các tham số user_id, stocking_id, page, pageSize, keyword dạng query
            keyword tìm theo seed_numberOfLot
            page: trang hiện tại
            pageSize: kích thước lấy
        url: /getpagination?user_id=...&stocking_id=...page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerSeed.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            seedService.GetAllByKeyword(params.user_id, params.stocking_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerSeed.get("/getbyid/:seed_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            seedService.GetById(req.params.seed_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo bill_id
    routerSeed.get("/getbybill/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            seedService.GetByBillId(req.params.bill_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo seedquality_id
    routerSeed.get("/getbyseedquality/:seedquality_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            seedService.GetBySeedQualityId(req.params.seedquality_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo bill_id và seedquality_id
    // /getlistbybillandseedquality?bill_id=...&seedquality_id=...
    routerSeed.get("/getlistbybillandseedquality", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            seedService.GetListBySeedAndBill(params.bill_id, params.seedquality_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách seed theo user_id và stocking_id 
    //Tham số nhận vào là seed_id và stocking_id 
    //Trả về mảng danh sách các seed
    // /getlistbyuserandstocking?user_id=...&stocking_id=...
    routerSeed.get("/getlistbyuserandstocking", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            seedService.GetListByUserAndStocking(params.user_id, params.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerSeed.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        seedService.MapSeed(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                seedService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    /*
        //Thêm mới nhiều seed cho một bill
        - Dùng để thêm mới danh sách các seed vào một bill
        - Nhận bill_id theo dạng params
        - Nhận vào id của bill và danh sách các seed truyền qua body theo dạng đối tượng
        {
            bill_id: ...,
            seeds: [
                {
                    seedquality_id: ...,
                    seed_numberOfLot: ...,
                    seed_quantity: ...,
                    seed_existence: ...,
                    seed_price: ...,
                    seed_source: ...,
                    seed_size: ...,
                },
                {...},
                {...}
            ]
        }
    */
    routerSeed.post("/createmulti/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        billService.GetById(req.params.bill_id, function(billData) {
            if (billData && body.seeds) {
                seedService.MapSeedArray(body, function(statusCode, arrData) {
                    if (statusCode == HttpStatus.OK) {
                        seedService.AddMulti(arrData, function(statusCode2, data) {
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
    routerSeed.put("/update/:seed_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        seedService.MapSeed(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                seedService.Update(data, req.params.seed_id, function(statusCode, dataNew) {
                    if (statusCode == HttpStatus.OK) {
                        billService.UpdateTotal(body.bill_id, function(statusCode3, dataTotal) {});
                    }
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerSeed.delete("/delete/:seed_id", auth.isJwtAuthenticated, function(req, res) {
        seedService.GetById(req.params.seed_id, function(dataFind) {
            if (dataFind) {
                seedService.Delete(dataFind, req.params.seed_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = SEED_CONTROLLER;