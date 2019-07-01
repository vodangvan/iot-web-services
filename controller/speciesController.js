var model = require('../models'),
    service = require('../services/Infrastructure'),
    speciesService = require('../services/SpeciesService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function SPECIES_CONTROLLER(routerSpecies) {
    var self = this;
    self.handleRoutes(routerSpecies);
}

SPECIES_CONTROLLER.prototype.handleRoutes = function(routerSpecies) {
    var self = this;
    //Lấy danh sách các loài
    routerSpecies.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            speciesService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách có phân trang
    routerSpecies.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            speciesService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm loài theo ID
    routerSpecies.get("/getbyid/:species_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            speciesService.GetById(req.params.species_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin loài
    routerSpecies.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        speciesService.MapSpecies(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                speciesService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin loài
    routerSpecies.put("/update/:species_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        speciesService.MapSpecies(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                speciesService.Update(data, req.params.species_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin loài
    routerSpecies.delete("/delete/:species_id", auth.isJwtAuthenticated, function(req, res) {
        speciesService.GetById(req.params.species_id, function(dataFind) {
            if (dataFind) {
                speciesService.Delete(dataFind, req.params.species_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = SPECIES_CONTROLLER;