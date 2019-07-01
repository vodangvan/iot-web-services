var model = require('../models'),
    service = require('../services/Infrastructure'),
    ageService = require('../services/AgeService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function AGE_CONTROLLER(routerAge) {
    var self = this;
    self.handleRoutes(routerAge);
}

AGE_CONTROLLER.prototype.handleRoutes = function(routerAge) {
    var self = this;
    //Lấy danh sách các loại tuổi nuôi
    routerAge.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            ageService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerAge.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            ageService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm loại tuổi theo ID
    routerAge.get("/getbyid/:age_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            ageService.GetById(req.params.age_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin loại tuổi
    routerAge.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        ageService.MapAge(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                ageService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loại tuổi
    routerAge.put("/update/:age_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        ageService.MapAge(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                ageService.Update(data, req.params.age_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loại tuổi
    routerAge.delete("/delete/:age_id", auth.isJwtAuthenticated, function(req, res) {
        ageService.GetById(req.params.age_id, function(dataFind) {
            if (dataFind) {
                ageService.Delete(dataFind, req.params.age_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = AGE_CONTROLLER;