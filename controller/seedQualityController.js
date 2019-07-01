var model = require('../models'),
    service = require('../services/Infrastructure'),
    seedQualityService = require('../services/SeedQualityService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function SEEDQUALITY_CONTROLLER(routerSeedQuality) {
    var self = this;
    self.handleRoutes(routerSeedQuality);
}

SEEDQUALITY_CONTROLLER.prototype.handleRoutes = function(routerSeedQuality) {
    var self = this;
    //Lấy danh sách
    /*routerSeedQuality.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            seedQualityService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerSeedQuality.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            seedQualityService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerSeedQuality.get("/getbyid/:seedquality_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            seedQualityService.GetById(req.params.seedquality_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerSeedQuality.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        seedQualityService.MapSeedQuality(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                seedQualityService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin
    routerSeedQuality.put("/update/:seedquality_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        seedQualityService.MapSeedQuality(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                seedQualityService.Update(data, req.params.seedquality_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerSeedQuality.delete("/delete/:seedquality_id", auth.isJwtAuthenticated, function(req, res) {
        seedQualityService.GetById(req.params.seedquality_id, function(dataFind) {
            if (dataFind) {
                seedQualityService.Delete(dataFind, req.params.seedquality_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = SEEDQUALITY_CONTROLLER;