var model = require('../models'),
    service = require('../services/Infrastructure'),
    thresholdService = require('../services/ThresholdService'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    HttpStatus = require('http-status-codes'),
    moment = require('moment'),
    config = require('../config/config.json')[env];

function THRESHOLD_CONTROLLER(routerThreshold) {
    var self = this;
    self.handleRoutes(routerThreshold);
}

THRESHOLD_CONTROLLER.prototype.handleRoutes = function(routerThreshold) {
    var self = this;
    //Lấy toàn bộ danh sách các ngưỡng
    // routerThreshold.get("/getall", auth.isJwtAuthenticated, function(req,res){
    //     try {
    //         thresholdService.GetAll(function(data){
    //            return service.CreateResponse(HttpStatus.OK, res, data);
    //         });                    
    //     } catch (error) {
    //         return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
    //     }       
    // });

    //Lấy danh sách tất cả ngưỡng trả về tên và id ngưỡng
    routerThreshold.get("/getallname", auth.isJwtAuthenticated, function(req, res) {
        try {
            thresholdService.GetListNameThreshold(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerThreshold.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            thresholdService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm thông tin ngưỡng theo id ngưỡng
    routerThreshold.get("/getbyid/:threshold_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            thresholdService.GetById(req.params.threshold_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách các ngưỡng theo loại số liệu datatype_id
    routerThreshold.get("/getlistbydatatype/:datatype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            thresholdService.GetListByDataType(req.params.datatype_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách các ngưỡng theo độ tuổi age_id
    routerThreshold.get("/getlistbyage/:age_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            thresholdService.GetListByAge(req.params.age_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách các ngưỡng theo khu vực/vùng nuôi
    routerThreshold.get("/getlistbyregion/:region_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            thresholdService.GetListByRegion(req.params.region_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách các ngưỡng theo loài nuôi
    routerThreshold.get("/getlistbyspecies/:species_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            thresholdService.GetListBySpecies(req.params.species_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy ra danh sách các ngưỡng theo 4 thông số: loại số liệu (datatype_id), độ tuổi (age_id), vùng nuôi (region_id), loài nuôi (species_id)
    routerThreshold.get("/getlistbydata", auth.isJwtAuthenticated, function(req, res) {
        try {
            var body = req.body;
            thresholdService.GetListByData(body.datatype_id, body.age_id, body.region_id, body.species_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin một ngưỡng
    routerThreshold.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        body.data_createdDate = body.data_createdDate._d;
        thresholdService.MapThreshold(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST) {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            } else {
                thresholdService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin một ngưỡng
    routerThreshold.put("/update/:threshold_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        body.data_createdDate = body.data_createdDate._d;
        thresholdService.MapThreshold(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                thresholdService.Update(data, req.params.threshold_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });

    });
    //Xóa thông tin một ngưỡng
    routerThreshold.delete("/delete/:threshold_id", auth.isJwtAuthenticated, function(req, res) {
        thresholdService.GetById(req.params.threshold_id, function(dataFind) {
            if (dataFind) {
                thresholdService.Delete(dataFind, req.params.threshold_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });

}

module.exports = THRESHOLD_CONTROLLER;