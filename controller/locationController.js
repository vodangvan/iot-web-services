var model = require('../models'),
    service = require('../services/Infrastructure'),
    locationService = require('../services/LocationService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config.json')[env];

function LOCATION_CONTROLLER(routerLocation) {
    var self = this;
    self.handleRoutes(routerLocation);
}

LOCATION_CONTROLLER.prototype.handleRoutes = function(routerLocation) {
    var self = this;
    //=============Tỉnh/TP================//
    //Lấy danh sách tất cả tỉnh/TP
    routerLocation.get("/getallprovince", function(req, res) {
        try {
            locationService.GetAllProvince(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách Tỉnh/TP có phân trang
    routerLocation.get("/getpaginationprovince", function(req, res) {
        try {
            var params = req.query;
            var page = params.page * params.pageSize;
            var pageSize = params.pageSize || config.pageSizeDefault;
            locationService.GetAllProvinceByKeyword(params.keyword, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm Tỉnh/TP theo id
    routerLocation.get("/getprovincebyid/:province_id", function(req, res) {
        try {
            locationService.GetProvinceById(req.params.province_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //=============Quận huyện================//
    //Lấy danh sách tất cả quận/huyện
    routerLocation.get("/getalldistrict", function(req, res) {
        try {
            locationService.GetAllDistrict(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách Quận/huyện có phân trang
    routerLocation.get("/getpaginationdistrict", function(req, res) {
        try {
            var params = req.query;
            var page = params.page * params.pageSize;
            locationService.GetAllDistrictByKeyword(params.keyword, page, params.pageSize || config.pageSizeDefault, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm quận/huyện theo id
    routerLocation.get("/getdistrictbyid/:district_id", function(req, res) {
        try {
            locationService.GetDistrictById(req.params.district_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách quận huyện theo tỉnh/thành phố
    routerLocation.get("/getdistrictbyprovince/:province_id", function(req, res) {
        try {
            locationService.GetDistrictByProvinceId(req.params.province_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //=============Xã phường================//
    //Lấy danh sách tất cả xã phường
    routerLocation.get("/getallward", function(req, res) {
        try {
            locationService.GetAllWard(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách xã/phường có phân trang
    routerLocation.get("/getpaginationward", function(req, res) {
        try {
            var params = req.query;
            var page = params.page * params.pageSize;
            locationService.GetAllWardByKeyword(params.keyword, page, params.pageSize || config.pageSizeDefault, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, params.pageSize || config.pageSizeDefault, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm xã/phường theo id
    routerLocation.get("/getwardbyid/:ward_id", function(req, res) {
        try {
            locationService.GetWardById(req.params.ward_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách xã/phường theo quận/huyện
    routerLocation.get("/getwardbydistrict/:district_id", function(req, res) {
        try {
            locationService.GetWardByDistrictId(req.params.district_id, function(dataNew) {
                return service.CreateResponse(HttpStatus.OK, res, dataNew);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

}

module.exports = LOCATION_CONTROLLER;