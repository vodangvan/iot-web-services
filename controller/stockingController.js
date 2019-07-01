var model = require('../models'),
    service = require('../services/Infrastructure'),
    stockingService = require('../services/StockingService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function STOCKING_CONTROLLER(routerStocking) {
    var self = this;
    self.handleRoutes(routerStocking);
}

STOCKING_CONTROLLER.prototype.handleRoutes = function(routerStocking) {
    var self = this;
    //Lấy danh sách tất cả các đợt thả nuôi
    routerStocking.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingService.GetAll(function(data) {
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
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo stocking_note
            3 biến trên truyền theo dạng query
        url: /getpagination/:user_id?page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerStocking.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            stockingService.GetAllByKeyword(req.params.user_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin đợt nuôi theo stocking_id
    routerStocking.get("/getbyid/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingService.GetById(req.params.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách đợt nuôi theo người nông dân
    routerStocking.get("/getbyuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingService.GetListByUser(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    routerStocking.get("/getbyguestuser/:user_id", function(req, res) {
        try {
            stockingService.GetListByUser(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách đợt nuôi theo loài nuôi
    routerStocking.get("/getbyspecies/:species_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingService.GetBySpeciesId(req.params.species_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách đợt nuôi theo tuổi nuôi
    routerStocking.get("/getbyage/:age_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            stockingService.GetByAgeId(req.params.age_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin đợt nuôi
    routerStocking.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        stockingService.MapStocking(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stockingService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin đợt nuôi
    routerStocking.put("/update/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        stockingService.MapStocking(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                stockingService.Update(data, req.params.stocking_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerStocking.delete("/delete/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        stockingService.GetById(req.params.stocking_id, function(dataFind) {
            if (dataFind) {
                stockingService.Delete(dataFind, req.params.stocking_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = STOCKING_CONTROLLER;