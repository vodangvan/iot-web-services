var model = require('../models'),
    service = require('../services/Infrastructure'),
    symptomService = require('../services/SymptomService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function SYMPTOM_CONTROLLER(routerSymptom) {
    var self = this;
    self.handleRoutes(routerSymptom);
}

SYMPTOM_CONTROLLER.prototype.handleRoutes = function(routerSymptom) {
    var self = this;
    //Lấy danh sách các loại tuổi nuôi
    routerSymptom.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            symptomService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerSymptom.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            symptomService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm theo ID
    routerSymptom.get("/getbyid/:symptom_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            symptomService.GetById(req.params.symptom_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Tìm theo mã bệnh 
    routerSymptom.get("/getbysickid/:sick_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            symptomService.GetBySickId(req.params.sick_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Thêm mới thông tin loại tuổi
    routerSymptom.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        symptomService.MapSymptom(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                symptomService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loại tuổi
    routerSymptom.put("/update/:symptom_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        symptomService.MapSymptom(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                symptomService.Update(data, req.params.symptom_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loại tuổi
    routerSymptom.delete("/delete/:symptom_id", auth.isJwtAuthenticated, function(req, res) {
        symptomService.GetById(req.params.symptom_id, function(dataFind) {
            if (dataFind) {
                symptomService.Delete(dataFind, req.params.symptom_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = SYMPTOM_CONTROLLER;