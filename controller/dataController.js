var model = require('../models'),
    service = require('../services/Infrastructure'),
    dataService = require('../services/DataService'),
    sinkService = require('../services/SinkService'),
    stationService = require('../services/StationService'),
    notificationService = require('../services/NotificationService'),
    pondService = require('../services/PondService'),
    riverService = require('../services/RiverService'),
    dataTypeService = require('../services/DataTypeService'),
    commonService = require('../services/CommonService'),    
    userService = require('../services/UserService'),
    blockNotifiService = require('../services/BlockNotificationService'),
    socketService = require('../services/Socket'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    randomstring = require("randomstring"),
    moment = require('moment'),
    messageConfig = require('../config/messageConfig'),
    env       = process.env.NODE_ENV || 'development',
    config = require('../config/config')[env];

function DATA_CONTROLLER(routerData) {
    var self = this;
    self.handleRoutes(routerData);
}

DATA_CONTROLLER.prototype.handleRoutes = function(routerData) {
    var self = this;
    //Lấy danh sách dữ liệu
    /*routerData.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            dataService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });                    
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }  
    });*/

    //Lấy danh sách có phân trang
    routerData.get("/getpagination",auth.isJwtAuthenticated, function(req, res){
        try{
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            dataService.GetAllByKeyword(params.keyword, page, pageSize, function(data){
            service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew){
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            }); 
        }catch(error){
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin dữ liệu theo id
    routerData.get("/getbyid/:data_id",auth.isJwtAuthenticated, function(req,res){
        try {
            dataService.GetById(req.params.data_id, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });

    //Lấy danh sách dữ liệu theo sink_id
    //Truyền vào ngày bắt đầu, ngày kết thúc
    routerData.get("/getbysink/:sink_id",auth.isJwtAuthenticated, function(req,res){
        try {
            var query = req.query;
            var dateEnd   = (query.dateEnd !="" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart !="" && query.dateStart)? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(3, 'days')._d;
            dataService.GetBySinkId(req.params.sink_id, dateStart, dateEnd, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });

    //Lấy danh sách dữ liệu theo station_id
    //Truyền vào ngày bắt đầu, ngày kết thúc
    routerData.get("/getbystation/:station_id", auth.isJwtAuthenticated,function(req,res){
        try {
            var query = req.query;
            var dateEnd   = (query.dateEnd !="" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart !="" && query.dateStart)? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(3, 'days')._d;
            dataService.GetByStationId(req.params.station_id, dateStart, dateEnd, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });

    //Lấy danh sách dữ liệu mới nhất theo station_id
    routerData.get("/gettopbystation/:station_id", auth.isJwtAuthenticated, function(req, res){
        var dataLast = {
            arrRow: [],
            affectedRows: 0,
            threshold_type: null
        }
        stationService.GetById(req.params.station_id, function(station){
            if(station){
                var arrDataType = station.station_node.split("|");      //Cắt các phần tử trong station_node
                //Loại dữ liệu lấy về của trạm cầm tay (typeStation = 0) hay trạm cố định (typeStation = 1)
                dataService.GetTopDataNew(station.station_id, arrDataType, "station_id", 1).then(function(dataArr){
                    if(dataArr.length > 0){
                        dataArr.forEach(function(dataObj, index){
                            if(dataObj.pond_id != null && dataObj.pond_id != undefined){
                                dataLast.threshold_type = 1;
                            }else if(dataObj.river_id != null && dataObj.river_id != undefined){
                                dataLast.threshold_type = 0;
                            }
                            dataTypeService.CompareLimit(dataObj.datatype_id, dataObj.data_value).then(function(dataCompare){
                                if(dataCompare.flag != 0){
                                     if(dataLast.arrRow.indexOf(index) == -1){
                                        dataLast.arrRow.push(index);
                                    }
                                    dataArr[index].threshold_level = 100;
                                    if(dataLast.arrRow.length == dataArr.length){
                                        return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                    }
                                }else{
                                    dataService.CheckThresholdData(dataObj.data_id, dataLast.threshold_type).then(function(data){
                                        if(data.length>0){
                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                dataLast.arrRow.push(index);
                                            }
                                            data.forEach(function(item){
                                                dataLast.affectedRows += 1;
                                                if(item.threshold_level)
                                                    if(!dataArr[index].threshold_level || dataArr[index].threshold_level <= item.threshold_level)
                                                        dataArr[index].threshold_level = item.threshold_level;             
                                                if(dataLast.arrRow.length == dataArr.length && dataLast.affectedRows == data.length){
                                                    return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                }else if(dataLast.affectedRows == data.length){
                                                    dataLast.affectedRows = 0;
                                                }
                                            });                                
                                        }else{
                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                dataLast.arrRow.push(index);
                                            }
                                            dataArr[index].threshold_level = 0;
                                            if(dataLast.arrRow.length == dataArr.length){
                                                return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                            }
                                        }
                                    });
                                }
                            });                           
                        });
                    }else{
                        return service.CreateResponse(HttpStatus.OK, res, dataArr);
                    }                                       
                });
            }else{
                return service.CreateResponse(HttpStatus.NOT_FOUND, res, req.params.station_id + " " + messageConfig.notFound);
            }
        });
    });

    //Lấy danh sách dữ liệu theo pond_id
    //Truyền vào ngày bắt đầu, ngày kết thúc
    routerData.get("/getbypond/:pond_id", auth.isJwtAuthenticated, function(req,res){
        try {
            var query = req.query;
            var dateEnd   = (query.dateEnd !="" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart !="" && query.dateStart)? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(3, 'days')._d;
            dataService.GetByPondId(req.params.pond_id, dateStart, dateEnd, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });

    //Lấy danh sách dữ liệu mới nhất theo pond_id
    routerData.get("/gettopbypond/:pond_id", auth.isJwtAuthenticated, function(req, res){
        var dataLast = {
            arrRow: [],
            affectedRows: 0,
            threshold_type: null
        }
        pondService.GetById(req.params.pond_id, function(pond){
            if(pond){
                dataTypeService.GetAllName().then(function(arrDataType){
                     dataService.GetTopDataNew(pond.pond_id, arrDataType, "pond_id", 1).then(function(dataArr){
                        if(dataArr.length > 0){
                            dataLast.threshold_type = 1;
                            dataArr.forEach(function(dataObj, index){
                                dataTypeService.CompareLimit(dataObj.datatype_id, dataObj.data_value).then(function(dataCompare){
                                if(dataCompare.flag != 0){
                                     if(dataLast.arrRow.indexOf(index) == -1){
                                        dataLast.arrRow.push(index);
                                    }
                                    dataArr[index].threshold_level = 100;
                                    if(dataLast.arrRow.length == dataArr.length){
                                        return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                    }
                                }else{
                                    dataService.CheckThresholdData(dataObj.data_id, dataLast.threshold_type).then(function(data){
                                        if(data.length>0){
                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                dataLast.arrRow.push(index);
                                            }
                                            data.forEach(function(item){
                                                dataLast.affectedRows += 1;
                                                if(item.threshold_level)
                                                    if(!dataArr[index].threshold_level || dataArr[index].threshold_level <= item.threshold_level)
                                                        dataArr[index].threshold_level = item.threshold_level;             
                                                if(dataLast.arrRow.length == dataArr.length && dataLast.affectedRows == data.length){
                                                    return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                }else if(dataLast.affectedRows == data.length){
                                                    dataLast.affectedRows = 0;
                                                }
                                            });                                
                                        }else{
                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                dataLast.arrRow.push(index);
                                            }
                                            dataArr[index].threshold_level = 0;
                                            if(dataLast.arrRow.length == dataArr.length){
                                                return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                            }
                                        }
                                    });
                                }
                            });                                
                            });  
                        }else{
                            return service.CreateResponse(HttpStatus.OK, res, dataArr);
                        }                                            
                    });
                });               
            }else{
                return service.CreateResponse(HttpStatus.NOT_FOUND, res, res.params.pond_id + " " + messageConfig.notFound);
            }
        });
    });

    //Lấy danh sách dữ liệu của trạm cầm tay theo pond_id
    //Truyền vào ngày bắt đầu, ngày kết thúc
    routerData.get("/getbyponddynamic/:pond_id", auth.isJwtAuthenticated, function(req,res){
        try {
            var query = req.query;
            var dateEnd   = (query.dateEnd !="" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart !="" && query.dateStart)? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(3, 'days')._d;
            dataService.GetByPondIdDynamic(req.params.pond_id, dateStart, dateEnd, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });

    //Lấy danh sách dữ liệu mới nhất theo pond_id của trạm cầm tay
    routerData.get("/gettopbyponddynamic/:pond_id", auth.isJwtAuthenticated, function(req, res){
        var dataLast = {
            arrRow: [],
            affectedRows: 0,
            threshold_type: null
        }
        pondService.GetById(req.params.pond_id, function(pond){
            if(pond){
                dataTypeService.GetAllName().then(function(arrDataType){
                     dataService.GetTopDataNew(pond.pond_id, arrDataType, "pond_id", 0).then(function(dataArr){
                        if(dataArr.length > 0){
                            dataLast.threshold_type = 1;
                            dataArr.forEach(function(dataObj, index){
                                dataTypeService.CompareLimit(dataObj.datatype_id, dataObj.data_value).then(function(dataCompare){
                                    if(dataCompare.flag != 0){
                                        if(dataLast.arrRow.indexOf(index) == -1){
                                            dataLast.arrRow.push(index);
                                        }
                                        dataArr[index].threshold_level = 100;
                                        if(dataLast.arrRow.length == dataArr.length){
                                            return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                        }
                                    }else{
                                        dataService.CheckThresholdData(dataObj.data_id, dataLast.threshold_type).then(function(data){
                                            if(data.length>0){
                                                if(dataLast.arrRow.indexOf(index) == -1){
                                                    dataLast.arrRow.push(index);
                                                }
                                                data.forEach(function(item){
                                                    dataLast.affectedRows += 1;
                                                    if(item.threshold_level)
                                                        if(!dataArr[index].threshold_level || dataArr[index].threshold_level <= item.threshold_level)
                                                            dataArr[index].threshold_level = item.threshold_level;             
                                                    if(dataLast.arrRow.length == dataArr.length && dataLast.affectedRows == data.length){
                                                        return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                    }else if(dataLast.affectedRows == data.length){
                                                        dataLast.affectedRows = 0;
                                                    }
                                                });                                
                                            }else{
                                                if(dataLast.arrRow.indexOf(index) == -1){
                                                    dataLast.arrRow.push(index);
                                                }
                                                dataArr[index].threshold_level = 0;
                                                if(dataLast.arrRow.length == dataArr.length){
                                                    return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                }
                                            }
                                        });
                                    }
                                });
                            }); 
                        }else{
                            return service.CreateResponse(HttpStatus.OK, res, dataArr);
                        }                                           
                    });
                });               
            }else{
                return service.CreateResponse(HttpStatus.NOT_FOUND, res, res.params.pond_id + " " + messageConfig.notFound);
            }
        });
    });

    //Lấy danh sách dữ liệu theo pond_id
    //Truyền vào ngày bắt đầu, ngày kết thúc
    routerData.get("/getbyriver/:river_id", auth.isJwtAuthenticated, function(req,res){
        try {
            var query = req.query;
            var dateEnd   = (query.dateEnd !="" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart !="" && query.dateStart)? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(3, 'days')._d;
            dataService.GetByRiverId(req.params.river_id, dateStart, dateEnd, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });
    //Lấy danh sách dữ liệu theo pond_id
    //Truyền vào ngày bắt đầu, ngày kết thúc
    routerData.get("/getbyriverdynamic/:river_id", auth.isJwtAuthenticated, function(req,res){
        try {
            var query = req.query;
            var dateEnd   = (query.dateEnd !="" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart !="" && query.dateStart)? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(3, 'days')._d;
            dataService.GetByRiverIdDynamic(req.params.river_id, dateStart, dateEnd, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });

    //Lấy danh sách dữ liệu mới nhất theo river_id của trạm cố định
    routerData.get("/gettopbyriver/:river_id", auth.isJwtAuthenticated, function(req, res){
        var dataLast = {
            arrRow: [],
            affectedRows: 0,
            threshold_type: null
        }
        riverService.GetById(req.params.river_id, function(river){
            if(river){
                dataTypeService.GetAllName().then(function(arrDataType){
                     dataService.GetTopDataNew(river.river_id, arrDataType, "river_id", 1).then(function(dataArr){
                        if(dataArr.length > 0){
                            dataLast.threshold_type = 0;
                            dataArr.forEach(function(dataObj, index){
                                dataTypeService.CompareLimit(dataObj.datatype_id, dataObj.data_value).then(function(dataCompare){
                                    if(dataCompare.flag != 0){
                                        if(dataLast.arrRow.indexOf(index) == -1){
                                            dataLast.arrRow.push(index);
                                        }
                                        dataArr[index].threshold_level = 100;
                                        if(dataLast.arrRow.length == dataArr.length){
                                            return service.CreateResponse(HttpStatus.OK, res, dataArr);
                                        }
                                    }else{
                                        dataService.CheckThresholdData(dataObj.data_id, dataLast.threshold_type).then(function(data){
                                            if(data.length>0){
                                                if(dataLast.arrRow.indexOf(index) == -1){
                                                    dataLast.arrRow.push(index);
                                                }
                                                data.forEach(function(item){
                                                    dataLast.affectedRows += 1;
                                                    if(item.threshold_level)
                                                        if(!dataArr[index].threshold_level || dataArr[index].threshold_level <= item.threshold_level)
                                                            dataArr[index].threshold_level = item.threshold_level;             
                                                    if(dataLast.arrRow.length == dataArr.length && dataLast.affectedRows == data.length){
                                                        return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                    }else if(dataLast.affectedRows == data.length){
                                                        dataLast.affectedRows = 0;
                                                    }
                                                });                                
                                            }else{
                                                if(dataLast.arrRow.indexOf(index) == -1){
                                                    dataLast.arrRow.push(index);
                                                }
                                                dataArr[index].threshold_level = 0;
                                                if(dataLast.arrRow.length == dataArr.length){
                                                    return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                }
                                            }
                                        });
                                    }
                                })
                            }); 
                        }else{
                            return service.CreateResponse(HttpStatus.OK, res, dataArr);
                        }                    
                    });
                });               
            }else{
                return service.CreateResponse(HttpStatus.NOT_FOUND, res, res.params.pond_id + " " + messageConfig.notFound);
            }
        });
    });

    //Lấy danh sách dữ liệu mới nhất theo river_id của trạm cầm tay
    routerData.get("/gettopbyriverdynamic/:river_id", auth.isJwtAuthenticated, function(req, res){
        var dataLast = {
            arrRow: [],
            affectedRows: 0,
            threshold_type: null
        }
        riverService.GetById(req.params.river_id, function(river){
            if(river){
                dataTypeService.GetAllName().then(function(arrDataType){
                     dataService.GetTopDataNew(river.river_id, arrDataType, "river_id", 0).then(function(dataArr){
                        if(dataArr.length > 0){
                            dataLast.threshold_type = 0;                            
                            dataArr.forEach(function(dataObj, index){
                                dataTypeService.CompareLimit(dataObj.datatype_id, dataObj.data_value).then(function(dataCompare){
                                    if(dataCompare.flag != 0){
                                        if(dataLast.arrRow.indexOf(index) == -1){
                                            dataLast.arrRow.push(index);
                                        }
                                        dataArr[index].threshold_level = 100;
                                        if(dataLast.arrRow.length == dataArr.length){
                                            return service.CreateResponse(HttpStatus.OK, res, dataArr);
                                        }
                                    }else{
                                        dataService.CheckThresholdData(dataObj.data_id, dataLast.threshold_type).then(function(data){
                                            if(data.length>0){
                                                if(dataLast.arrRow.indexOf(index) == -1){
                                                    dataLast.arrRow.push(index);
                                                }
                                                data.forEach(function(item){
                                                    dataLast.affectedRows += 1;
                                                    if(item.threshold_level)
                                                        if(!dataArr[index].threshold_level || dataArr[index].threshold_level <= item.threshold_level)
                                                            dataArr[index].threshold_level = item.threshold_level;             
                                                    if(dataLast.arrRow.length == dataArr.length && dataLast.affectedRows == data.length){
                                                        return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                    }else if(dataLast.affectedRows == data.length){
                                                        dataLast.affectedRows = 0;
                                                    }
                                                });                                
                                            }else{
                                                if(dataLast.arrRow.indexOf(index) == -1){
                                                    dataLast.arrRow.push(index);
                                                }
                                                dataArr[index].threshold_level = 0;
                                                if(dataLast.arrRow.length == dataArr.length){
                                                    return service.CreateResponse(HttpStatus.OK, res, dataArr)
                                                }
                                            }
                                        });
                                    }
                                });
                            });   
                        }else{
                            return service.CreateResponse(HttpStatus.OK, res, dataArr);
                        }                  
                    });
                });               
            }else{
                return service.CreateResponse(HttpStatus.NOT_FOUND, res, res.params.pond_id + " " + messageConfig.notFound);
            }
        });
    });
    
    //Lấy danh sách dữ liệu theo datatype_id
    //Truyền vào ngày bắt đầu, ngày kết thúc
    routerData.get("/getbydatatype/:datatype_id", auth.isJwtAuthenticated, function(req,res){
        try {
            var query = req.query;
            var dateEnd   = (query.dateEnd !="" && query.dateEnd) ? moment(new Date(query.dateEnd)).tz(config.timezoneDefault)._d : moment(new Date()).tz(config.timezoneDefault)._d;
            var dateStart = (query.dateStart !="" && query.dateStart)? moment(new Date(query.dateStart)).tz(config.timezoneDefault)._d : moment(dateEnd).subtract(3, 'days')._d;
            dataService.GetByDataTypeId(req.params.datatype_id, dateStart, dateEnd, function(data){
                return service.CreateResponse(HttpStatus.OK, res, data);
            });       
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }       
    });

    //Thêm mới dữ liệu (từ raspberry)
    //Truyền vào các tham số: sink_code, sink_secret, data_stationType, Items[{station_code, data_createdDate, datatype_id, pond_id, data_value}] 
    //data_createDate sẽ nhận từ trạm, nếu như ko có dữ liệu thì data_createDate sẽ lấy từ server
    routerData.post("/create", function(req,res){
        var body = req.body;
        var io = res.io;
        body.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        body.data_createdDate = body.data_createdDate._d;
        //Xác thực trạm thu gom dữ liệu (raspberry) thông qua mã code và secret
        if(body.data_stationType >=0 && body.data_stationType <=1){
            sinkService.ValidateSink(body.sink_code, body.sink_secret).then(function(flag){
                if(flag){
                    if(body.Items && body.Items.length > 0){
                        var dataArray = [];                
                        dataArray = body.Items;
                        //Loại bỏ các phần tử trùng lập trong mảng
                        dataArray = dataArray.filter((item, index, self)=> self.findIndex((t)=> {return t.station_code === item.station_code && t.datatype_id === item.datatype_id && t.pond_id === item.pond_id; }) === index)
                        var dataLast = {
                            arrdata : [],
                            error: [],
                            affectedRows : 0,
                            arrRow: [],
                            threshold_type: null
                        };
                        //Duyệt qua các phần tử trong mảng sau khi loại bỏ trùng lập dữ liệu
                        dataArray.forEach(function(item){
                            //Lấy id của trạm thu gom (raspberry) và id của các trạm đo (arduino)
                            dataService.GetSinkAndStationID(body.sink_code, item.station_code).then(function(obj){
                                if(obj.station_id == 0 || obj.sink_id == 0){
                                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.sinkStationNodFound);
                                }else{
                                    //Kiểm tra trùng lập dữ liệu trong cùng thời gian, nếu trùng lập sẽ bỏ qua
                                    dataService.CheckDuplicatedData(item.pond_id, item.river_id, obj.sink_id, obj.station_id, item.datatype_id, body.data_createdDate).then(function(flag){
                                        //Kiểm tra nếu như dữ liệu trùng lập sẽ bỏ qua
                                        if(flag)
                                            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                                        else{
                                            body.sink_id = obj.sink_id;
                                            body.station_id= obj.station_id;
                                            body.datatype_id = item.datatype_id;
                                            body.pond_id = item.pond_id;
                                            body.river_id = item.river_id;
                                            body.data_value = item.data_value;  
                                            body.data_stationType = body.data_stationType                              
                                            if(item.data_createdDate){
                                                body.data_createdDate = moment(new Date(item.data_createdDate)).tz(config.timezoneDefault)._d;
                                            }
                                            dataService.MapData(body).then(function(data){      
                                                if(data.statusCode == HttpStatus.BAD_REQUEST){
                                                    dataLast.error.push(data.data);         
                                                }else{
                                                    dataLast.arrdata.push(data.data);
                                                    dataLast.affectedRows += 1;
                                                };  
                                                if(dataLast.affectedRows == dataArray.length){
                                                    //Thêm dữ liệu số đo vào cơ sở dữ liệu
                                                    dataService.AddMulti(dataLast.arrdata, function(statusCode, dataNew){
                                                        if(statusCode == HttpStatus.CREATED){    
                                                            //Thêm thành công              
                                                            dataNew.forEach(function(dataNewObj, index){
                                                                if(dataNewObj.pond_id != null && dataNewObj.pond_id != undefined){
                                                                    dataLast.threshold_type = 1;
                                                                }else if(dataNewObj.river_id != null && dataNewObj.river_id != undefined){
                                                                    dataLast.threshold_type = 0;
                                                                }  
                                                                dataTypeService.CompareLimit(dataNewObj.dataValues.datatype_id, dataNewObj.dataValues.data_value).then(function(dataCompare){
                                                                    if(dataCompare.flag != 0){
                                                                        if(dataLast.arrRow.indexOf(index) == -1){
                                                                            dataLast.arrRow.push(index);
                                                                        }                                                            
                                                                        dataNew[index].dataValues.threshold_level = 100;
                                                                        dataService.GetUserOrRegion(dataNewObj.dataValues.pond_id, dataNewObj.dataValues.river_id).then(function(dataResult){                                                                    
                                                                            var objNotif = {
                                                                                threshold_id: null,
                                                                                user_id: dataResult.user_id,
                                                                                data_id: dataNewObj.dataValues.data_id,
                                                                                region_id: dataResult.region_id,
                                                                                notif_title: dataCompare.datatype.dataValues.datatype_name + " của " + obj.station_name + " " + messageConfig.valueMinMax,
                                                                                notif_readState: 0,
                                                                                notif_createdDate: body.data_createdDate,
                                                                                notif_type: 1
                                                                            };   
                                                                            notificationService.MapNotification(objNotif).then(function(objNew){
                                                                                if(objNew.statusCode == HttpStatus.OK){
                                                                                    notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                                        //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                        if(statusCode == HttpStatus.CREATED){
                                                                                            dataNotifi.dataValues.threshold_level = 100;
                                                                                            socketService.SendNotifiToClient(io, config.notifiDataThreshold + body.station_id, dataNotifi);
                                                                                        };
                                                                                    });  
                                                                                };                                                        
                                                                            });
                                                                        });
                                                                        if(dataLast.arrRow.length == dataLast.affectedRows){
                                                                            //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                            socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataNew);
                                                                        }
                                                                    }else{
                                                                        //Kiểm tra ngưỡng của số liệu, trả về một mảng các ngưỡng                         
                                                                        dataService.CheckThresholdData(dataNewObj.data_id, dataLast.threshold_type).then(function(data){
                                                                            if(data.length>0){
                                                                                data.forEach(function(item){
                                                                                    if(dataLast.arrRow.indexOf(index) == -1){
                                                                                        dataLast.arrRow.push(index);
                                                                                    }
                                                                                    if(item.threshold_level)
                                                                                        if(!dataNew[index].dataValues.threshold_level || dataNew[index].dataValues.threshold_level <= item.threshold_level)
                                                                                            dataNew[index].dataValues.threshold_level = item.threshold_level;
                                                                                    //Kiểm tra xem dữ liệu ngưỡng đã được tạo thông báo hay chưa
                                                                                    var t = moment(new Date()).tz(config.timezoneDefault);
                                                                                    t = t.subtract(item.threshold_timeWarning, 'm')._d;
                                                                                    notificationService.CheckDuplicatedNotifi(item.threshold_id, item.user_id, item.datatype_id, t)
                                                                                    .then(function(checkFlag){
                                                                                        if(!checkFlag){
                                                                                            var objNotif = {
                                                                                                threshold_id: item.threshold_id,
                                                                                                data_id: dataNewObj.data_id,
                                                                                                user_id: item.user_id,
                                                                                                region_id: item.region_id,
                                                                                                notif_title: item.threshold_name,
                                                                                                notif_readState: 0,
                                                                                                notif_createdDate: body.data_createdDate
                                                                                            };
                                                                                            notificationService.MapNotification(objNotif).then(function(objNew){
                                                                                                if(objNew.statusCode == HttpStatus.OK){
                                                                                                    notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                                                        //Gửi thông báo đến client khi một thông báo được thêm thành công
                                                                                                        if(statusCode == HttpStatus.CREATED){
                                                                                                            dataNotifi.dataValues.threshold_level = item.threshold_level;
                                                                                                            socketService.SendNotifiToClient(io, config.notifiDataThreshold + body.station_id, dataNotifi);
                                                                                                            if(dataLast.threshold_type == 1){
                                                                                                                //Kiểm tra để gửi SMS
                                                                                                                blockNotifiService.CheckBlockNotifi(item.user_id, body.station_id).then(function(flag){
                                                                                                                    if(flag == false && item.user_sendSms == true){
                                                                                                                        notificationService.GetNotifiSendSms(dataNotifi.notif_id).then(function(dataSms){
                                                                                                                            commonService.ReplaceContent(dataSms[0]).then(function(content){
                                                                                                                                commonService.SendSms(item.user_phone, content);
                                                                                                                            });
                                                                                                                        });
                                                                                                                    };
                                                                                                                });                                                                                          
                                                                                                            };
                                                                                                        };
                                                                                                    });  
                                                                                                };                                                        
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                    if(dataLast.arrRow.length == dataLast.affectedRows){
                                                                                        //Gửi dữ liệu reatime cho client đang lắng nghe                                                            
                                                                                        socketService.SendDataToClient(io, body.data_stationType, body.pond_id, body.river_id, body.station_id, dataNew);
                                                                                    }
                                                                                }); 
                                                                            }else{
                                                                                if(dataLast.arrRow.indexOf(index) == -1){
                                                                                    dataLast.arrRow.push(index);
                                                                                }
                                                                                dataNew[index].dataValues.threshold_level = 0;
                                                                                if(dataLast.arrRow.length == dataLast.affectedRows){
                                                                                        //Gửi dữ liệu reatime cho client đang lắng nghe                                                            
                                                                                    socketService.SendDataToClient(io, body.data_stationType, body.pond_id, body.river_id, body.station_id, dataNew);
                                                                                }
                                                                            }                                                                
                                                                        }); 
                                                                    }
                                                                });
                                                            });
                                                            return service.CreateResponse(HttpStatus.CREATED, res, dataNew); 
                                                        }else if(statusCode == HttpStatus.BAD_REQUEST){
                                                            return service.CreateResponse(statusCode, res, dataNew);
                                                        };
                                                    });                                            
                                                }else if(dataLast.error.length >0){
                                                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, dataLast.error);
                                                }
                                            });                                
                                        };
                                    });
                                }                        
                            });
                        });
                    }else{
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, "Items is not null");
                    }                   
                }else{
                    return service.CreateResponse(HttpStatus.FORBIDDEN, res, messageConfig.permissionDenied);
                }
            });
        }else{
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, "data_stationType incorrect");
        }        
    });

    //Thêm mới dữ liệu (từ Arduino)
    //Truyền theo dạng params các thông số: station_code, station_secret, pond_id, data_value, datatype_id, data_stationType
    //Hàm dùng các biến đặt tên như CSDL
    routerData.post("/insert", function(req, res){
        var io = res.io;
        var params = req.query;
        params.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        params.data_createdDate = params.data_createdDate._d;
        var dataLast ={
            arrRow: [],
            threshold_type: null
        };
        //Xác thực trạm arduino
        stationService.ValidateStation(params.station_code, params.station_secret).then(function(obj){
            if(obj.flag){
                 //Kiểm tra rỗng của pond và river
                obj.data.pond_id = obj.data.pond_id || params.pond_id;
                obj.data.river_id = obj.data.river_id || params.river_id;
                if(obj.data.pond_id != null || obj.data.river_id != null){
                    if(obj.data.pond_id != null && obj.data.pond_id != undefined){
                        dataLast.threshold_type = 1;
                    }else if(obj.data.river_id != null && obj.data.river_id != undefined){
                        dataLast.threshold_type = 0;
                    }
                    //Kiểm tra dữ liệu trùng lặp
                    dataService.CheckDuplicatedData(params.pond_id, obj.data.river_id, null, obj.data.station_id, params.datatype_id, params.data_createdDate).then(function(flag){
                        if(flag)
                            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                        else{
                            if(params.data_stationType >= 0 && params.data_stationType <= 1){
                                params.sink_id = null;
                                params.station_id= obj.data.station_id;
                                params.datatype_id = params.datatype_id;
                                params.pond_id = obj.data.pond_id || params.pond_id;
                                params.river_id = obj.data.river_id || params.river_id;
                                params.data_value = params.data_value;      
                                params.data_stationType = params.data_stationType,                     
                                dataService.MapData(params).then(function(data){                                    
                                    if(data.statusCode == HttpStatus.BAD_REQUEST)
                                        return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});          
                                    else{
                                        dataService.Add(data.data, function(statusCode, dataNew){  
                                            if(statusCode == HttpStatus.CREATED){               
                                                var dataSend = [];
                                                dataSend.push(dataNew);   
                                                dataTypeService.CompareLimit(dataSend[0].dataValues.datatype_id, dataSend[0].dataValues.data_value).then(function(dataCompare){
                                                    if(dataCompare.flag != 0){                                                                                                           
                                                        dataSend[0].dataValues.threshold_level = 100;
                                                        dataService.GetUserOrRegion(dataSend[0].dataValues.pond_id, dataSend[0].dataValues.river_id).then(function(dataResult){                                                                    
                                                            var objNotif = {
                                                                threshold_id: null,
                                                                user_id: dataResult.user_id,
                                                                data_id: dataSend[0].dataValues.data_id,
                                                                region_id: dataResult.region_id,
                                                                notif_title: dataCompare.datatype.dataValues.datatype_name + " của " + obj.data.dataValues.station_name + " " + messageConfig.valueMinMax,
                                                                notif_readState: 0,
                                                                notif_createdDate: params.data_createdDate,
                                                                notif_type: 1
                                                            };   
                                                            notificationService.MapNotification(objNotif).then(function(objNew){
                                                                if(objNew.statusCode == HttpStatus.OK){
                                                                    notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                        //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                        if(statusCode == HttpStatus.CREATED){
                                                                            dataNotifi.dataValues.threshold_level = 100;
                                                                            socketService.SendNotifiToClient(io, config.notifiDataThreshold + params.station_id, dataNotifi);                                                                                                                                                                             
                                                                        };
                                                                    });  
                                                                };                                                        
                                                            });
                                                        });
                                                        socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataSend);
                                                    }else{
                                                        //Kiểm tra ngưỡng của số liệu, trả về một mảng các ngưỡng                         
                                                        dataService.CheckThresholdData(dataNew.data_id, dataLast.threshold_type).then(function(data){
                                                            //Nếu dữ liệu thuộc ngưỡng
                                                            if(data.length>0){
                                                                //Duyệt qua các ngưỡng
                                                                data.forEach(function(item, index){
                                                                    if(dataLast.arrRow.indexOf(index) == -1){
                                                                        dataLast.arrRow.push(index);
                                                                    }
                                                                    if(item.threshold_level)
                                                                        if(!dataSend[0].dataValues.threshold_level || dataSend[0].dataValues.threshold_level <= item.threshold_level)
                                                                            dataSend[0].dataValues.threshold_level = item.threshold_level;
                                                                    //Kiểm tra xem dữ liệu ngưỡng đã được tạo thông báo hay chưa (trùng lặp dữ liệu)
                                                                    var t = moment(new Date()).tz(config.timezoneDefault);
                                                                    t = t.subtract(item.threshold_timeWarning, 'm')._d;
                                                                    notificationService.CheckDuplicatedNotifi2(item.threshold_id, item.user_id, item.region_id, params.datatype_id, t)
                                                                    .then(function(checkFlag){
                                                                        if(!checkFlag){
                                                                            var objNotif = {
                                                                                threshold_id: item.threshold_id,
                                                                                data_id: dataNew.data_id,
                                                                                user_id: item.user_id || null,
                                                                                region_id: item.region_id || null,
                                                                                notif_title: item.threshold_name,
                                                                                notif_readState: 0,
                                                                                notif_createdDate: params.data_createdDate
                                                                            };
                                                                            notificationService.MapNotification(objNotif).then(function(objNew){
                                                                                if(objNew.statusCode == HttpStatus.OK){
                                                                                    notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                                        //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                        if(statusCode == HttpStatus.CREATED){
                                                                                            dataNotifi.dataValues.threshold_level = item.threshold_level;
                                                                                            socketService.SendNotifiToClient(io, config.notifiDataThreshold + item.station_id , dataNotifi);
                                                                                            if(dataLast.threshold_type == 1){
                                                                                                //Kiểm tra để gửi SMS
                                                                                                blockNotifiService.CheckBlockNotifi(item.user_id, params.station_id).then(function(flag){
                                                                                                    if(flag == false && item.user_sendSms == true){
                                                                                                        notificationService.GetNotifiSendSms(dataNotifi.notif_id).then(function(dataSms){
                                                                                                            commonService.ReplaceContent(dataSms[0]).then(function(content){
                                                                                                                commonService.SendSms(item.user_phone, content);
                                                                                                            });
                                                                                                        });
                                                                                                    };
                                                                                                });                                                                                          
                                                                                            }                                                                                
                                                                                        }                                                                                
                                                                                    });  
                                                                                };                                                        
                                                                            });
                                                                        }
                                                                    });
                                                                    if(dataLast.arrRow.length == data.length){
                                                                        //Gửi dữ liệu reatime cho client đang lắng nghe                                                            
                                                                        socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataSend);
                                                                    } 
                                                                });
                                                            }else{
                                                                dataSend[0].dataValues.threshold_level = 0;
                                                                //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataSend);
                                                            }
                                                        }); 
                                                    }
                                                });
                                                //Trả kết quả về cho trạm
                                                if(obj.data.station_updateStatus == 1){
                                                    return service.CreateResponse(config.dataResult, res, {STATUS:"YES"});
                                                }else{
                                                    return service.CreateResponse(config.dataResult, res, {STATUS:"NO"});
                                                }                                      
                                            }else{
                                                return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});   
                                            }                                    
                                        });
                                    };  
                                });    
                            }else{
                                return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});   
                            }                                                        
                        };
                    });
                }                
            }else{
                return service.CreateResponse(HttpStatus.FORBIDDEN, res, messageConfig.permissionDenied);
            }
        });
    });
    
    //Lưu số liệu từ Arduino gồm nhiều số liệu của nhiều loại yếu tố môi trường
    //Hàm dùng các biến được viết tắt, nhằm giảm độ dài cho các trạm
    //Truyền tham số vào dạng params:
    /*
     *station_code
     *station_secret
     *pond_id
     *data_stationType
     *Items[sothutu][data_value]
     *Items[sothutu][datatype_id]
     *Items là một mảng với sothutu là index
     */
    //Giá trị nhận về là mảng dữ lệu
    // /api/data/
    routerData.post("/insertmulti", function(req, res){
        var params = req.query;
        var io = res.io;
        params.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        params.data_createdDate = params.data_createdDate._d;
        //Xác thực trạm arduino
        stationService.ValidateStation(params.station_code, params.station_secret).then(function(obj){
            if(obj.flag){
                if(params.Items && params.Items.length > 0){
                    var dataArray = [];                
                    dataArray = params.Items;
                    //Loại bỏ các phần tử trùng lập trong mảng
                    dataArray = dataArray.filter((item, index, self) => self.findIndex((t) => {return t.datatype_id === item.datatype_id; }) === index)
                    var dataLast = {
                        arrdata : [],
                        error: [],
                        affectedRows : 0,
                        arrRow: [],
                        dataRow: 0,
                        threshold_type: null
                    };
                    obj.data.pond_id = obj.data.pond_id || params.pond_id;
                    obj.data.river_id = obj.data.river_id || params.river_id;
                    //Kiểm tra rỗng của pond và river
                    if(obj.data.pond_id != null || obj.data.river_id != null){
                        if(obj.data.pond_id != null && obj.data.pond_id != undefined){
                            dataLast.threshold_type = 1;
                        }else if(obj.data.river_id != null && obj.data.river_id != undefined){
                            dataLast.threshold_type = 0;
                        }
                        if(params.data_stationType >= 0 && params.data_stationType <= 1){
                            //Duyệt qua các phần tử trong mảng trong mảng sau khi loại bỏ phần tử trùng nhau
                            dataArray.forEach(function(item){
                                dataService.CheckDuplicatedData(obj.data.pond_id, obj.data.river_id, null, obj.data.station_id, item.datatype_id, params.data_createdDate).then(function(flag){
                                    if(flag)
                                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                                    else{
                                        params.sink_id = null;
                                        params.station_id = obj.data.station_id;
                                        params.datatype_id = item.datatype_id;
                                        params.pond_id = obj.data.pond_id;
                                        params.river_id = obj.data.river_id;
                                        params.data_value = item.data_value;      
                                        params.data_stationType = params.data_stationType,                  
                                        dataService.MapData(params).then(function(data){                                    
                                            if(data.statusCode == HttpStatus.BAD_REQUEST){
                                                dataLast.error.push(data.data);         
                                            }else{
                                                dataLast.arrdata.push(data.data);
                                                dataLast.affectedRows += 1;
                                            };  
                                            if(dataLast.affectedRows == dataArray.length){
                                                dataService.AddMulti(dataLast.arrdata, function(statusCode, dataNew){
                                                    if(statusCode == HttpStatus.CREATED){            
                                                        dataNew.forEach(function(dataNewObj, index){
                                                            dataTypeService.CompareLimit(dataNewObj.dataValues.datatype_id, dataNewObj.dataValues.data_value).then(function(dataCompare){
                                                                if(dataCompare.flag != 0){
                                                                    if(dataLast.arrRow.indexOf(index) == -1){
                                                                        dataLast.arrRow.push(index);
                                                                    }                                                            
                                                                    dataNew[index].dataValues.threshold_level = 100;
                                                                    dataService.GetUserOrRegion(dataNewObj.dataValues.pond_id, dataNewObj.dataValues.river_id).then(function(dataResult){                                                                    
                                                                        var objNotif = {
                                                                            threshold_id: null,
                                                                            user_id: dataResult.user_id,
                                                                            data_id: dataNewObj.dataValues.data_id,
                                                                            region_id: dataResult.region_id,
                                                                            notif_title: dataCompare.datatype.dataValues.datatype_name + " của " + obj.data.dataValues.station_name + " " + messageConfig.valueMinMax,
                                                                            notif_readState: 0,
                                                                            notif_createdDate: params.data_createdDate,
                                                                            notif_type: 1
                                                                        };   
                                                                        notificationService.MapNotification(objNotif).then(function(objNew){
                                                                            if(objNew.statusCode == HttpStatus.OK){
                                                                                notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                                    //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                    if(statusCode == HttpStatus.CREATED){
                                                                                        dataNotifi.dataValues.threshold_level = 100;            
                                                                                        //Gửi thông báo theo ID trạm: notifi_data_ + station_id                                                          
                                                                                        socketService.SendNotifiToClient(io, config.notifiDataThreshold + params.station_id, dataNotifi);
                                                                                    }
                                                                                });  
                                                                            };                                                        
                                                                        });
                                                                    });
                                                                    if(dataLast.arrRow.length == dataLast.affectedRows){
                                                                        //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                        socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataNew);
                                                                    }
                                                                }else{
                                                                    //Kiểm tra ngưỡng của số liệu, trả về một mảng các ngưỡng                         
                                                                    dataService.CheckThresholdData(dataNewObj.dataValues.data_id, dataLast.threshold_type).then(function(data){
                                                                        //Nếu có ngưỡng
                                                                        if(data.length>0){
                                                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                                                dataLast.arrRow.push(index);
                                                                            }
                                                                            //Duyệt qua các ngưỡng, tạo thông báo cho người dùng
                                                                            data.forEach(function(item){  
                                                                                dataLast.dataRow += 1;                                                              
                                                                                if(item.threshold_level)
                                                                                    if(!dataNew[index].dataValues.threshold_level || dataNew[index].dataValues.threshold_level <= item.threshold_level)
                                                                                        dataNew[index].dataValues.threshold_level = item.threshold_level;
                                                                                //Kiểm tra xem dữ liệu ngưỡng đã được tạo thông báo hay chưa
                                                                                var t = moment(new Date()).tz(config.timezoneDefault);
                                                                                t = t.subtract(item.threshold_timeWarning, 'm')._d;
                                                                                notificationService.CheckDuplicatedNotifi2(item.threshold_id, item.user_id, item.region_id, item.datatype_id, t)
                                                                                .then(function(checkFlag){
                                                                                    if(!checkFlag){
                                                                                        var objNotif = {
                                                                                            threshold_id: item.threshold_id,                                                                                    
                                                                                            data_id: dataNewObj.data_id,
                                                                                            user_id: item.user_id || null,
                                                                                            region_id: item.region_id || null,
                                                                                            notif_title: item.threshold_name,
                                                                                            notif_readState: 0,
                                                                                            notif_createdDate: params.data_createdDate,
                                                                                            notif_type: 0
                                                                                        };                                       
                                                                                        notificationService.MapNotification(objNotif).then(function(objNew){
                                                                                            if(objNew.statusCode == HttpStatus.OK){
                                                                                                notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                                                    //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                                    if(statusCode == HttpStatus.CREATED){
                                                                                                        dataNotifi.dataValues.threshold_level = item.threshold_level;
                                                                                                        socketService.SendNotifiToClient(io, config.notifiDataThreshold + params.station_id, dataNotifi); 
                                                                                                        if(dataLast.threshold_type == 1){
                                                                                                            //Kiểm tra để gửi SMS
                                                                                                            blockNotifiService.CheckBlockNotifi(item.user_id, params.station_id).then(function(flag){
                                                                                                                if(flag == false && item.user_sendSms == true){
                                                                                                                    notificationService.GetNotifiSendSms(dataNotifi.notif_id).then(function(dataSms){
                                                                                                                        commonService.ReplaceContent(dataSms[0]).then(function(content){
                                                                                                                            commonService.SendSms(item.user_phone, content);
                                                                                                                        });
                                                                                                                    });
                                                                                                                }   
                                                                                                            });                                                                                          
                                                                                                        }
                                                                                                    }                                                                                        
                                                                                                });  
                                                                                            };                                                        
                                                                                        });
                                                                                    }
                                                                                });
                                                                                if(dataLast.arrRow.length == dataNew.length && dataLast.dataRow == data.length){
                                                                                    //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                                    socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataNew);
                                                                                }else if(dataLast.dataRow == data.length){
                                                                                    dataLast.dataRow = 0;
                                                                                }
                                                                            });
                                                                        }else{
                                                                            //Nếu không thuộc ngưỡng
                                                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                                                dataLast.arrRow.push(index);
                                                                            }
                                                                            dataNew[index].dataValues.threshold_level = 0;
                                                                            if(dataLast.arrRow.length == dataLast.affectedRows){
                                                                                //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                                socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataNew);
                                                                            }
                                                                        }                                                         
                                                                    });  
                                                                }
                                                            });                                                                                                      
                                                        });          
                                                        if(obj.data.station_updateStatus == 1){
                                                            return service.CreateResponse(config.dataResult, res, {STATUS:"YES"});
                                                        }else{
                                                            return service.CreateResponse(config.dataResult, res, {STATUS:"NO"});
                                                        }
                                                    }else if(statusCode == HttpStatus.BAD_REQUEST){
                                                        return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                                                    };                                      
                                                });
                                            }else if(dataLast.error.length >0){
                                                return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                                            }
                                        });                        
                                    };
                                });
                            });
                        }else{
                            return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                        }
                    }else{
                        return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                    }                    
                }else{
                    return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                }
            }else{
                return service.CreateResponse(config.dataResult, res, {STATUS:"NOTACCESS"});
            }
        });
    });

    //Tương tự insertmulti, nhưng các tên biến được rút ngắn
    routerData.post("/insertmulti2", function(req, res){
        var params = req.query;
        var io = res.io;
        params.data_createdDate = moment(new Date()).tz(config.timezoneDefault);
        params.data_createdDate = params.data_createdDate._d;
        //Xác thực trạm arduino
        stationService.ValidateStation(params.st_code, params.st_secret).then(function(obj){
            if(obj.flag){
                if(params.Items && params.Items.length > 0){
                    var dataArray = [];                
                    dataArray = params.Items;
                    //Loại bỏ các phần tử trùng lập trong mảng
                    dataArray = dataArray.filter((item, index, self) => self.findIndex((t) => {return t.dt_id === item.dt_id; }) === index);
                    var dataLast = {
                        arrdata : [],
                        error: [],
                        affectedRows : 0,
                        arrRow: [],
                        dataRow: 0,
                        threshold_type: null
                    };
                    obj.data.pond_id = obj.data.pond_id || params.p_id;
                    obj.data.river_id = obj.data.river_id || params.r_id;
                    //Kiểm tra rỗng của pond và river
                    if(obj.data.pond_id != null || obj.data.river_id != null){
                        //Kiểm tra là số đo của ao hay sông
                        //Nếu của sông thì 0 của ao thì 1, khác thì null
                        if(obj.data.pond_id != null && obj.data.pond_id != undefined){
                            dataLast.threshold_type = 1;
                        }else if(obj.data.river_id != null && obj.data.river_id != undefined){
                            dataLast.threshold_type = 0;
                        }
                        if(params.st_type >= 0 && params.st_type <= 1){
                            //Duyệt qua các phần tử trong mảng dữ liệu từ các trạm gửi lên đã được lọc bỏ các phần tử trùng nhau
                            dataArray.forEach(function(item){
                                dataService.CheckDuplicatedData(obj.data.pond_id, obj.data.river_id, null, obj.data.station_id, item.dt_id, params.data_createdDate).then(function(flag){
                                    if(flag)
                                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
                                    else{
                                        params.sink_id = null;
                                        params.station_id= obj.data.station_id;
                                        params.datatype_id = item.dt_id;
                                        params.pond_id = obj.data.pond_id;
                                        params.river_id = obj.data.river_id;
                                        params.data_value = item.d_value;      
                                        params.data_stationType = params.st_type,                  
                                        dataService.MapData(params).then(function(data){                                    
                                            if(data.statusCode == HttpStatus.BAD_REQUEST){
                                                dataLast.error.push(data.data);         
                                            }else{
                                                dataLast.arrdata.push(data.data);
                                                dataLast.affectedRows += 1;
                                            };  
                                            if(dataLast.affectedRows == dataArray.length){
                                                dataService.AddMulti(dataLast.arrdata, function(statusCode, dataNew){
                                                    if(statusCode == HttpStatus.CREATED){            
                                                        dataNew.forEach(function(dataNewObj, index){
                                                            dataTypeService.CompareLimit(dataNewObj.dataValues.datatype_id, dataNewObj.dataValues.data_value).then(function(dataCompare){
                                                                if(dataCompare.flag != 0){
                                                                    if(dataLast.arrRow.indexOf(index) == -1){
                                                                        dataLast.arrRow.push(index);
                                                                    }                                                            
                                                                    dataNew[index].dataValues.threshold_level = 100;
                                                                    dataService.GetUserOrRegion(dataNewObj.dataValues.pond_id, dataNewObj.dataValues.river_id).then(function(dataResult){                                                                    
                                                                        var objNotif = {
                                                                            threshold_id: null,
                                                                            user_id: dataResult.user_id,
                                                                            data_id: dataNewObj.dataValues.data_id,
                                                                            region_id: dataResult.region_id,
                                                                            notif_title: dataCompare.datatype.dataValues.datatype_name + " của " + obj.data.dataValues.station_name + " " + messageConfig.valueMinMax,
                                                                            notif_readState: 0,
                                                                            notif_createdDate: params.data_createdDate,
                                                                            notif_type: 1
                                                                        };
                                                                        notificationService.MapNotification(objNotif).then(function(objNew){
                                                                            if(objNew.statusCode == HttpStatus.OK){
                                                                                notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                                    //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                    if(statusCode == HttpStatus.CREATED){
                                                                                        dataNotifi.dataValues.threshold_level = 100;                                                                               
                                                                                        socketService.SendNotifiToClient(io, config.notifiDataThreshold + params.station_id, dataNotifi);                                                                           
                                                                                    }                                                                                        
                                                                                });  
                                                                            };                                                        
                                                                        });
                                                                    });
                                                                    if(dataLast.arrRow.length == dataLast.affectedRows){
                                                                        //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                        socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataNew);
                                                                    }
                                                                }else{
                                                                    //Kiểm tra ngưỡng của số liệu, trả về một mảng các ngưỡng                         
                                                                    dataService.CheckThresholdData(dataNewObj.dataValues.data_id, dataLast.threshold_type).then(function(data){
                                                                        //Nếu dữ liệu thuộc ngưỡng
                                                                        if(data.length>0){
                                                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                                                dataLast.arrRow.push(index);
                                                                            }
                                                                            //Duyệt qua các ngưỡng để tạo các thông báo cho người dùng
                                                                            data.forEach(function(item){  
                                                                                dataLast.dataRow += 1;                                                              
                                                                                if(item.threshold_level)
                                                                                    if(!dataNew[index].dataValues.threshold_level || dataNew[index].dataValues.threshold_level <= item.threshold_level)
                                                                                        dataNew[index].dataValues.threshold_level = item.threshold_level;
                                                                                //Kiểm tra xem dữ liệu ngưỡng đã được tạo thông báo hay chưa
                                                                                var t = moment(new Date()).tz(config.timezoneDefault);
                                                                                t = t.subtract(item.threshold_timeWarning, 'm')._d;
                                                                                notificationService.CheckDuplicatedNotifi2(item.threshold_id, item.user_id, item.region_id, item.datatype_id, t)
                                                                                .then(function(checkFlag){
                                                                                    if(!checkFlag){
                                                                                        var objNotif = {
                                                                                            threshold_id: item.threshold_id,
                                                                                            data_id: dataNewObj.data_id,
                                                                                            user_id: item.user_id || null,
                                                                                            region_id: item.region_id || null,
                                                                                            notif_title: item.threshold_name,
                                                                                            notif_readState: 0,
                                                                                            notif_createdDate: params.data_createdDate,
                                                                                            notif_type: 0
                                                                                        };
                                                                                        notificationService.MapNotification(objNotif).then(function(objNew){
                                                                                            if(objNew.statusCode == HttpStatus.OK){
                                                                                                notificationService.Add(objNew.data, function(statusCode, dataNotifi){     
                                                                                                    //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                                    if(statusCode == HttpStatus.CREATED){
                                                                                                        dataNotifi.dataValues.threshold_level = item.threshold_level;
                                                                                                        socketService.SendNotifiToClient(io, config.notifiDataThreshold + params.station_id, dataNotifi);
                                                                                                        if(dataLast.threshold_type == 1){
                                                                                                            //Kiểm tra để gửi SMS
                                                                                                            blockNotifiService.CheckBlockNotifi(item.user_id, params.station_id).then(function(flag){
                                                                                                                if(flag == false && item.user_sendSms == true){
                                                                                                                    notificationService.GetNotifiSendSms(dataNotifi.notif_id).then(function(dataSms){
                                                                                                                        commonService.ReplaceContent(dataSms[0]).then(function(content){
                                                                                                                            commonService.SendSms(item.user_phone, content);
                                                                                                                        });
                                                                                                                    });
                                                                                                                }   
                                                                                                            });                                                                                          
                                                                                                        }                                                                                                                                                                              
                                                                                                    }                                                                                        
                                                                                                });  
                                                                                            };                                                        
                                                                                        });
                                                                                    }
                                                                                });
                                                                                if(dataLast.arrRow.length == dataNew.length && dataLast.dataRow == data.length){
                                                                                    //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                                    socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataNew);
                                                                                }else if(dataLast.dataRow == data.length){
                                                                                    dataLast.dataRow = 0;
                                                                                }
                                                                            });
                                                                        }else{
                                                                            //Nếu dữ liệu không thuộc ngưỡng nào hết
                                                                            if(dataLast.arrRow.indexOf(index) == -1){
                                                                                dataLast.arrRow.push(index);
                                                                            }
                                                                            dataNew[index].dataValues.threshold_level = 0;
                                                                            if(dataLast.arrRow.length == dataLast.affectedRows){
                                                                                //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                                socketService.SendDataToClient(io, params.data_stationType, params.pond_id, params.river_id, params.station_id, dataNew);
                                                                            }
                                                                        }                                                         
                                                                    });   
                                                                }
                                                            });                                                                                               
                                                        });                                                
                                                    if(obj.data.station_updateStatus == 1){
                                                            return service.CreateResponse(config.dataResult, res, {STATUS:"YES"});
                                                        }else{
                                                            return service.CreateResponse(config.dataResult, res, {STATUS:"NO"});
                                                        }
                                                    }else if(statusCode == HttpStatus.BAD_REQUEST){
                                                        return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                                                    };
                                                });
                                            }else if(dataLast.error.length >0){
                                                return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                                            }
                                        });                                                          
                                    };
                                });
                            });
                        }else{
                            return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                        }              
                    }else{
                        return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                    }
                }else{
                    return service.CreateResponse(config.dataResult, res, {STATUS:"FAIL"});
                }
            }else{
                return service.CreateResponse(config.dataResult, res, {STATUS:"NOTACCESS"});
            }
        });
    });
}

module.exports = DATA_CONTROLLER;
