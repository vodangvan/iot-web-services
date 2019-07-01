var model = require('../models'),
    service = require('../services/Infrastructure'),
    treatmentService = require('../services/TreatmentService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function TREATMENT_CONTROLLER(routerTreatment) {
    var self = this;
    self.handleRoutes(routerTreatment);
}

TREATMENT_CONTROLLER.prototype.handleRoutes = function(routerTreatment) {
    var self = this;
    //Lấy danh sách các loại tuổi nuôi
    routerTreatment.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            treatmentService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerTreatment.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            treatmentService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm loại tuổi theo ID
    routerTreatment.get("/getbyid/:treatment_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            treatmentService.GetById(req.params.treatment_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Tìm theo mã bệnh
    routerTreatment.get("/getbysickid/:sick_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            treatmentService.GetBySickId(req.params.sick_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Thêm mới thông tin loại tuổi
    routerTreatment.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        treatmentService.MapTreatment(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                treatmentService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loại tuổi
    routerTreatment.put("/update/:treatment_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        treatmentService.MapTreatment(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                treatmentService.Update(data, req.params.treatment_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loại tuổi
    routerTreatment.delete("/delete/:treatment_id", auth.isJwtAuthenticated, function(req, res) {
        treatmentService.GetById(req.params.treatment_id, function(dataFind) {
            if (dataFind) {
                treatmentService.Delete(dataFind, req.params.treatment_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = TREATMENT_CONTROLLER;