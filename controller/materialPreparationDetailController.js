var model = require('../models'),
    service = require('../services/Infrastructure'),
    materialPreparationDetailService = require('../services/MaterialPreparationDetailService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function MATERIAL_PREPARATION_DETAIL_CONTROLLER(routerMaterialPreparationDetail) {
    var self = this;
    self.handleRoutes(routerMaterialPreparationDetail);
}

MATERIAL_PREPARATION_DETAIL_CONTROLLER.prototype.handleRoutes = function(routerMaterialPreparationDetail) {
    var self = this;
    //Lấy danh sách 
    /*routerMaterialPreparationDetail.get("/getall",auth.isJwtAuthenticated , function(req,res){
        try {
            materialPreparationDetailService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerMaterialPreparationDetail.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            materialPreparationDetailService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin chi tiết
    // /getdetail?pondpreparation_id=...&material_id=...
    routerMaterialPreparationDetail.get("/getdetail", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            materialPreparationDetailService.GetDetail(params.pondpreparation_id, params.material_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo pondpreparation_id
    routerMaterialPreparationDetail.get("/getbypondpreparation/:pondpreparation_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialPreparationDetailService.GetByPondPreparationId(req.params.pondpreparation_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo material_id
    routerMaterialPreparationDetail.get("/getbymaterial/:material_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialPreparationDetailService.GetByMaterialId(req.params.material_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy matepredetail_number lớn nhất theo pondpreparation_id và material_id
    // /getmaxnumber?pondpreparation_id=...&material_id=...
    routerMaterialPreparationDetail.get("/getmaxnumber", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialPreparationDetailService.GetMaxNumber(req.query.pondpreparation_id, req.query.material_id, function(maxData) {
                return service.CreateResponse(HttpStatus.OK, res, maxData);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới 
    routerMaterialPreparationDetail.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        materialPreparationDetailService.MapMaterialPreparationDetail(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {

                materialPreparationDetailService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });

            }
        });
    });

    //Cập nhật thông tin 
    // /update?pondpreparation_id=...&material_id=...
    routerMaterialPreparationDetail.put("/update", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        var params = req.query;
        materialPreparationDetailService.MapMaterialPreparationDetail(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                materialPreparationDetailService.Update(data, params.pondpreparation_id, params.material_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin 
    // /delete?pondpreparation_id=...&material_id=...
    routerMaterialPreparationDetail.delete("/delete", auth.isJwtAuthenticated, function(req, res) {
        var params = req.query;
        materialPreparationDetailService.GetDetail(params.pondpreparation_id, params.material_id, function(dataFind) {
            if (dataFind) {
                materialPreparationDetailService.Delete(dataFind, params.pondpreparation_id, params.material_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = MATERIAL_PREPARATION_DETAIL_CONTROLLER;