var model = require('../models'),
    service = require('../services/Infrastructure'),
    activityMaterialService = require('../services/ActivityMaterialService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function ACTIVITYMATERIAL_CONTROLLER(routerActivityMaterial) {
    var self = this;
    self.handleRoutes(routerActivityMaterial);
}

ACTIVITYMATERIAL_CONTROLLER.prototype.handleRoutes = function(routerActivityMaterial) {
    var self = this;
    //Lấy danh sách 
    routerActivityMaterial.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityMaterialService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerActivityMaterial.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            activityMaterialService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách hoạt động theo material_id
    routerActivityMaterial.get("/getbymaterial/:material_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityMaterialService.GetByMaterialId(req.params.material_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách vật liệu theo loại activity_id
    routerActivityMaterial.get("/getbyactivity/:activity_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            activityMaterialService.GetByActivityId(req.params.activity_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới 
    routerActivityMaterial.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        activityMaterialService.MapActivityMaterial(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                activityMaterialService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });


    /*
        Thêm nhiều dòng một lúc
        - Dùng để thêm mới vào danh sách nhiều dòng cùng lúc
        
        {
            data: [
                {
                    material_id: ...,
                    activity_id: ...,
                    actimaterial_amount: ...
                },
                {...},
                {...}
            ]
        }
    */
    routerActivityMaterial.post("/createmulti", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        if (body.data && body.data.length > 0) {
            activityMaterialService.MapActivityMaterialMulti(body.data, function(statusCode, arrData) {
                if (statusCode == HttpStatus.OK) {
                    activityMaterialService.AddMulti(arrData, function(statusCode2, data) {
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
    routerActivityMaterial.put("/update/:activity_id/:material_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        activityMaterialService.MapActivity(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                activityMaterialService.Update(data, req.params.activity_id, req.params.material_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin
    routerActivityMaterial.delete("/delete/:activity_id/:material_id", auth.isJwtAuthenticated, function(req, res) {
        activityMaterialService.GetById(req.params.activity_id, function(dataFind) {
            if (dataFind) {
                activityMaterialService.Delete(dataFind, req.params.activity_id, req.params.material_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data);
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = ACTIVITYMATERIAL_CONTROLLER;