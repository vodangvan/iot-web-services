var model = require('../models'),
    service = require('../services/Infrastructure'),
    harvestDetailService = require('../services/HarvestDetailService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function HARVESTDETAIL_CONTROLLER(routerHarvestDetail) {
    var self = this;
    self.handleRoutes(routerHarvestDetail);
}

HARVESTDETAIL_CONTROLLER.prototype.handleRoutes = function(routerHarvestDetail) {
    var self = this;
    //Lấy danh sách
    /*routerHarvestDetail.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            harvestDetailService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerHarvestDetail.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            harvestDetailService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin chi tiết
    // /getdetail?harvest_id=...&prodtype_id=...&harvedeta_number=...
    routerHarvestDetail.get("/getdetail", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            harvestDetailService.GetDetail(params.harvest_id, params.prodtype_id, params.harvedeta_number, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo harvest_id và prodtype_id
    // /getlistdetail?harvest_id=...&prodtype_id=...
    routerHarvestDetail.get("/getlistdetail", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            harvestDetailService.GetListByHarvestAndProductType(params.harvest_id, params.prodtype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo harvest_id
    routerHarvestDetail.get("/getbyharvest/:harvest_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            harvestDetailService.GetByHarvestId(req.params.harvest_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo prodtype_id
    routerHarvestDetail.get("/getbyproducttype/:prodtype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            harvestDetailService.GetByProductTypeId(req.params.prodtype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo stocking_id và pond_id
    // /getlistbystockingandpond?stocking_id=....&pond_id=....
    routerHarvestDetail.get("/getlistbystockingandpond", auth.isJwtAuthenticated, function(req, res) {
        try {
            harvestDetailService.GetListByStockingAndPond(req.query.stocking_id, req.query.pond_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerHarvestDetail.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        harvestDetailService.MapHarvestDetail(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                harvestDetailService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    routerHarvestDetail.post("/createmulti/:havest_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        var havestID = req.params.havest_id;
        if (body.data && body.data.length > 0) {
            harvestDetailService.MapHarvestDetailMulti(body.data, havestID, function(statusCode, arrData) {
                if (statusCode == HttpStatus.OK) {
                    harvestDetailService.AddMulti(arrData, function(statusCode2, data) {
                        return service.CreateResponse(statusCode2, res, data);
                    });
                } else {
                    return service.CreateResponse(statusCode, res, arrData);
                }
            });
        } else {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist)
        }
    });

    //Cập nhật thông tin 
    // /update?harvest_id=...&prodtype_id=...&harvedeta_number=...
    routerHarvestDetail.put("/update", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        var params = req.query;
        harvestDetailService.MapHarvestDetail(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                harvestDetailService.Update(data, params.harvest_id, params.prodtype_id, params.harvedeta_number, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    // /delete?harvest_id=...&prodtype_id=...&harvedeta_number=...
    routerHarvestDetail.delete("/delete", auth.isJwtAuthenticated, function(req, res) {
        var params = req.query;
        harvestDetailService.GetDetail(params.harvest_id, params.prodtype_id, params.harvedeta_number, function(dataFind) {
            if (dataFind) {
                harvestDetailService.Delete(dataFind, params.harvest_id, params.prodtype_id, params.harvedeta_number, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = HARVESTDETAIL_CONTROLLER;