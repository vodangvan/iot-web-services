var model = require('../models'),
    service = require('../services/Infrastructure'),
    sensorService = require('../services/SensorService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];


function SENSOR_CONTROLLER(routerSensor) {
    var self = this;
    self.handleRoutes(routerSensor);
}

SENSOR_CONTROLLER.prototype.handleRoutes = function(routerSensor) {
    var self = this;
    //Lấy danh sách tất cả các sensor
    /*routerSensor.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            sensorService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerSensor.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            sensorService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin sensor theo sensor_id
    routerSensor.get("/getbyid/:sensor_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            sensorService.GetById(req.params.sensor_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin sensor theo serial number
    routerSensor.get("/getbyserialnumber/:serialnumber", auth.isJwtAuthenticated, function(req, res) {
        try {
            sensorService.GetBySerialNumber(req.params.serialnumber, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });


    //Lấy danh sách sensor theo station_id
    routerSensor.get("/getbystation/:station_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            sensorService.GetByStationId(req.params.station_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách sensor theo datatype_id
    routerSensor.get("/getbydatatype/:datatype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            sensorService.GetByDataTypeId(req.params.datatype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin sensor
    routerSensor.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        sensorService.MapSensor(body, function(statusCode, data) {
            sensorService.CheckSensorOfStation(null, data.station_id, data.datatype_id, function(flag) {
                if (!flag) {
                    if (statusCode == HttpStatus.BAD_REQUEST)
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
                    else {
                        sensorService.Add(data, function(statusCode, dataNew) {
                            return service.CreateResponse(statusCode, res, dataNew);
                        });
                    }
                } else {
                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.sensorStationExits);
                }
            });
        });
    });

    //Cập nhật thông tin trạm
    routerSensor.put("/update/:sensor_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        sensorService.MapSensor(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                sensorService.CheckSensorOfStation(req.params.sensor_id, data.station_id, data.datatype_id, function(flag) {
                    if (!flag) {
                        sensorService.Update(data, req.params.sensor_id, function(statusCode, dataNew) {
                            return service.CreateResponse(statusCode, res, dataNew);
                        });
                    } else {
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.sensorStationExits);
                    }
                });
            }
        });
    });

    //Xóa thông tin một sensor
    routerSensor.delete("/delete/:sensor_id", auth.isJwtAuthenticated, function(req, res) {
        sensorService.GetById(req.params.sensor_id, function(dataFind) {
            if (dataFind) {
                sensorService.Delete(dataFind, req.params.sensor_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExits });
            }
        });
    });


}

module.exports = SENSOR_CONTROLLER;