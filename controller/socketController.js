var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require("q");
var notificationService = require('../services/NotificationService'),
    userService = require('../services/UserService'),
    regionService = require('../services/RegionService'),
    service = require('../services/Infrastructure'),
    dataService = require('../services/DataService'),
    stationConfigService = require('../services/StationConfigService'),
    stationService = require('../services/StationService'),
    configTypeService = require('../services/ConfigTypeService'),
    dataTypeService = require('../services/DataTypeService'),
    commonService = require('../services/CommonService'),
    blockNotifiService = require('../services/BlockNotificationService'),
    socketService = require('../services/Socket'),
    HttpStatus = require('http-status-codes'),
    moment = require('moment'),
    messageConfig = require('../config/messageConfig.json'),
    env = process.env.NODE_ENV || 'development',
    config = require('../config/config.json')[env];

module.exports = {
    RunSocket: function(socket) {
        socket.on('login', function(user_id) {
            userService.GetById(user_id, function(dataUser) {
                regionService.GetListByUser(dataUser).then(function(arrRegion) {
                    var arrRegionID = [];
                    if (arrRegion.length > 0) {
                        arrRegion.forEach(function(item) {
                            arrRegionID.push(item.region_id);
                            if (arrRegionID.length == arrRegion.length) {
                                notificationService.GetNotificationByLogin(user_id, arrRegionID, dataUser.dataValues.user_levelManager).then(function(data) {
                                    socket.emit('login_notification', data);
                                });
                            }
                        });
                    } else {
                        notificationService.GetNotificationByLogin(user_id, arrRegionID, dataUser.dataValues.user_levelManager).then(function(data) {
                            socket.emit('login_notification', data);
                        });
                    }
                });
            });
        });
    },

    RunSocketForStation: function(socket, io, esp8266_nsp) {
        //Lấy danh sách cấu hình
        socket.on('ST_Config', function(package) {
            stationService.GetStatus(package.station_code).then(function(status) {
                if (status.station_updateStatus == 1) {
                    try {
                        var dataResult = {};
                        var dataLast = {
                            arrRow: []
                        }
                        stationService.GetByCode(package.station_code).then(function(station) {
                            if (station) {
                                stationConfigService.GetByStationAndStatus(station.dataValues.station_id, 1, function(data) {
                                    data.forEach(function(item, index) {
                                        configTypeService.GetCmdKeyWordById(item.configtype_id).then(function(cmdKeyword) {
                                            if (dataLast.arrRow.indexOf(index) == -1) {
                                                dataLast.arrRow.push(index);
                                            }
                                            if (data) {
                                                dataResult[cmdKeyword.dataValues.configtype_cmdKeyword] = item.stationconfig_value;
                                            }
                                            if (dataLast.arrRow.length == data.length) {
                                                //return service.CreateResponse(config.dataResult, res, dataResult);                                                
                                                esp8266_nsp.emit('C_' + package.station_code, dataResult);
                                                console.log('C_' + package.station_code);
                                            }
                                        });
                                    });
                                });
                            } else {
                                esp8266_nsp.emit('C_' + package.station_code, { ERROR: "TRUE" });
                            }
                        });
                    } catch (error) {
                        esp8266_nsp.emit('C_' + package.station_code, { ERROR: "TRUE" });
                    }
                } else {
                    esp8266_nsp.emit('C_' + package.station_code, { STATUS: "NO" });
                }
            });
        });
        //Báo kết quả cập nhật
        socket.on('RS_Config', function(package) {
            var obj = {};
            var dataLast = {
                    arrRow: []
                }
                //Nếu thất bại thì cập nhật trạng thái station_updateStatus = null
            if (package.result == 0) {
                stationService.GetByCode(package.station_code).then(function(station) {
                    if (station) {
                        stationService.Update({
                            station_updateStatus: null //Thông báo cập nhật cấu hình thất bại
                        }, station.station_id, function(statusCode, dataNew) {
                            if (statusCode == HttpStatus.OK) {
                                esp8266_nsp.emit("I_" + package.station_code, { STATUS: "YES" });
                            } else {
                                esp8266_nsp.emit("I_" + package.station_code, { STATUS: "NO" });
                            }
                        });
                    } else {
                        esp8266_nsp.emit("I_" + package.station_code, { STATUS: "CODEFAIL" });
                    }
                });
            } else if (package.result == 1) { //Cập nhật thành công
                stationService.GetByCode(package.station_code).then(function(station) {
                    if (station) {
                        stationConfigService.GetByStationAndStatus(station.station_id, 1, function(data) {
                            if (data.length > 0) {
                                obj.station_updateStatus = 0;
                                data.forEach(function(item, index) {
                                    configTypeService.GetVariableById(item.dataValues.configtype_id).then(function(variable) {
                                        if (dataLast.arrRow.indexOf(index) == -1) {
                                            dataLast.arrRow.push(index);
                                        }
                                        if (data) {
                                            obj[variable.dataValues.configtype_variable] = item.dataValues.stationconfig_value;
                                        }
                                        if (dataLast.arrRow.length == data.length) {
                                            stationConfigService.UpdateStatus(station.station_id, 1, 0).then(function(flag) {});
                                            stationService.Update(obj, station.station_id, function(statusCode, dataNew) {
                                                if (statusCode == HttpStatus.OK) {
                                                    esp8266_nsp.emit("I_" + package.station_code, { STATUS: "YES" });
                                                } else {
                                                    esp8266_nsp.emit("I_" + package.station_code, { STATUS: "NO" });
                                                }
                                            });
                                        }
                                    });
                                });
                            } else {
                                esp8266_nsp.emit("I_" + package.station_code, { STATUS: "NO" });
                            }
                        });
                    } else {
                        esp8266_nsp.emit("I_" + package.station_code, { STATUS: "CODEFAIL" });
                    }
                });
            }
        });
        //Insert dữ liệu đo
        socket.on('StationData', function(package) {
            var dataPackage = package;
            dataPackage.data_createdDate = moment(new Date()).tz(config.timezoneDefault)._d;
            stationService.ValidateStation(dataPackage.st_code, dataPackage.st_secret).then(function(obj) {
                if (obj.flag) {
                    if (dataPackage.Items && dataPackage.Items.length > 0) {
                        var dataArray = [];
                        dataArray = dataPackage.Items;
                        //Loại bỏ các phần tử trùng lập trong mảng
                        dataArray = dataArray.filter((item, index, self) => self.findIndex((t) => { return t.dt_id === item.dt_id; }) === index);
                        var dataLast = {
                            arrdata: [],
                            error: [],
                            affectedRows: 0,
                            arrRow: [],
                            dataRow: 0,
                            threshold_type: null
                        };
                        obj.data.pond_id = obj.data.pond_id || dataPackage.p_id;
                        obj.data.river_id = obj.data.river_id || dataPackage.r_id;
                        if (obj.data.pond_id != null || obj.data.river_id != null) {
                            //Kiểm tra là số đo của ao hay sông
                            //Nếu của sông thì 0 của ao thì 1, khác thì null
                            if (obj.data.pond_id != null && obj.data.pond_id != undefined) {
                                dataLast.threshold_type = 1;
                            } else if (obj.data.river_id != null && obj.data.river_id != undefined) {
                                dataLast.threshold_type = 0;
                            }
                            if (dataPackage.st_type >= 0 && dataPackage.st_type <= 1) {
                                dataArray.forEach(function(item) {
                                    dataService.CheckDuplicatedData(obj.data.pond_id, obj.data.river_id, null, obj.data.station_id, item.dt_id, dataPackage.data_createdDate).then(function(flag) {
                                        if (!flag) {
                                            dataPackage.sink_id = null;
                                            dataPackage.station_id = obj.data.station_id;
                                            dataPackage.datatype_id = item.dt_id;
                                            dataPackage.pond_id = obj.data.pond_id;
                                            dataPackage.river_id = obj.data.river_id;
                                            dataPackage.data_value = item.d_value;
                                            dataPackage.data_stationType = dataPackage.st_type,
                                                dataService.MapData(dataPackage).then(function(data) {
                                                    if (data.statusCode == HttpStatus.BAD_REQUEST) {
                                                        dataLast.error.push(data.data);
                                                    } else {
                                                        dataLast.arrdata.push(data.data);
                                                        dataLast.affectedRows += 1;
                                                    };
                                                    if (dataLast.affectedRows == dataArray.length) {
                                                        dataService.AddMulti(dataLast.arrdata, function(statusCode, dataNew) {
                                                            if (statusCode == HttpStatus.CREATED) {
                                                                dataNew.forEach(function(dataNewObj, index) {
                                                                    dataTypeService.CompareLimit(dataNewObj.dataValues.datatype_id, dataNewObj.dataValues.data_value).then(function(dataCompare) {
                                                                        if (dataCompare.flag != 0) {
                                                                            if (dataLast.arrRow.indexOf(index) == -1) {
                                                                                dataLast.arrRow.push(index);
                                                                            }
                                                                            dataNew[index].dataValues.threshold_level = 100;
                                                                            dataService.GetUserOrRegion(dataNewObj.dataValues.pond_id, dataNewObj.dataValues.river_id).then(function(dataResult) {
                                                                                var objNotif = {
                                                                                    threshold_id: null,
                                                                                    user_id: dataResult.user_id,
                                                                                    data_id: dataNewObj.dataValues.data_id,
                                                                                    region_id: dataResult.region_id,
                                                                                    notif_title: dataCompare.datatype.dataValues.datatype_name + " của " + obj.data.dataValues.station_name + " " + messageConfig.valueMinMax,
                                                                                    notif_readState: 0,
                                                                                    notif_createdDate: dataPackage.data_createdDate,
                                                                                    notif_type: 1
                                                                                };
                                                                                notificationService.MapNotification(objNotif).then(function(objNew) {
                                                                                    if (objNew.statusCode == HttpStatus.OK) {
                                                                                        notificationService.Add(objNew.data, function(statusCode, dataNotifi) {
                                                                                            //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                            if (statusCode == HttpStatus.CREATED) {
                                                                                                dataNotifi.dataValues.threshold_level = 100;
                                                                                                socketService.SendNotifiToClient(io, config.notifiDataThreshold + dataPackage.station_id, dataNotifi);
                                                                                            }
                                                                                        });
                                                                                    };
                                                                                });
                                                                            });
                                                                            if (dataLast.arrRow.length == dataLast.affectedRows) {
                                                                                //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                                socketService.SendDataToClient(io, dataPackage.data_stationType, dataPackage.pond_id, dataPackage.river_id, dataPackage.station_id, dataNew);
                                                                            }
                                                                        } else {
                                                                            //Kiểm tra ngưỡng của số liệu, trả về một mảng các ngưỡng                         
                                                                            dataService.CheckThresholdData(dataNewObj.dataValues.data_id, dataLast.threshold_type).then(function(data) {
                                                                                //Nếu dữ liệu thuộc ngưỡng
                                                                                if (data.length > 0) {
                                                                                    if (dataLast.arrRow.indexOf(index) == -1) {
                                                                                        dataLast.arrRow.push(index);
                                                                                    }
                                                                                    //Duyệt qua các ngưỡng để tạo các thông báo cho người dùng
                                                                                    data.forEach(function(item) {
                                                                                        dataLast.dataRow += 1;
                                                                                        if (item.threshold_level)
                                                                                            if (!dataNew[index].dataValues.threshold_level || dataNew[index].dataValues.threshold_level <= item.threshold_level)
                                                                                                dataNew[index].dataValues.threshold_level = item.threshold_level;
                                                                                            //Kiểm tra xem dữ liệu ngưỡng đã được tạo thông báo hay chưa
                                                                                        var t = moment(new Date()).tz(config.timezoneDefault);
                                                                                        t = t.subtract(item.threshold_timeWarning, 'm')._d;
                                                                                        notificationService.CheckDuplicatedNotifi2(item.threshold_id, item.user_id, item.region_id, item.datatype_id, t)
                                                                                            .then(function(checkFlag) {
                                                                                                if (!checkFlag) {
                                                                                                    var objNotif = {
                                                                                                        threshold_id: item.threshold_id,
                                                                                                        data_id: dataNewObj.data_id,
                                                                                                        user_id: item.user_id || null,
                                                                                                        region_id: item.region_id || null,
                                                                                                        notif_title: item.threshold_name,
                                                                                                        notif_readState: 0,
                                                                                                        notif_createdDate: dataPackage.data_createdDate,
                                                                                                        notif_type: 0
                                                                                                    };
                                                                                                    notificationService.MapNotification(objNotif).then(function(objNew) {
                                                                                                        if (objNew.statusCode == HttpStatus.OK) {
                                                                                                            notificationService.Add(objNew.data, function(statusCode, dataNotifi) {
                                                                                                                //Gửi thông báo đến client khi một thông báo được thêm thàn công
                                                                                                                if (statusCode == HttpStatus.CREATED) {
                                                                                                                    dataNotifi.dataValues.threshold_level = item.threshold_level;
                                                                                                                    socketService.SendNotifiToClient(io, config.notifiDataThreshold + dataPackage.station_id, dataNotifi);
                                                                                                                    if (dataLast.threshold_type == 1) {
                                                                                                                        //Kiểm tra để gửi SMS
                                                                                                                        blockNotifiService.CheckBlockNotifi(item.user_id, dataPackage.station_id).then(function(flag) {
                                                                                                                            if (flag == false && item.user_sendSms == true) {
                                                                                                                                notificationService.GetNotifiSendSms(dataNotifi.notif_id).then(function(dataSms) {
                                                                                                                                    commonService.ReplaceContent(dataSms[0]).then(function(content) {
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
                                                                                        if (dataLast.arrRow.length == dataNew.length && dataLast.dataRow == data.length) {
                                                                                            //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                                            socketService.SendDataToClient(io, dataPackage.data_stationType, dataPackage.pond_id, dataPackage.river_id, dataPackage.station_id, dataNew);
                                                                                        } else if (dataLast.dataRow == data.length) {
                                                                                            dataLast.dataRow = 0;
                                                                                        }
                                                                                    });
                                                                                } else {
                                                                                    //Nếu dữ liệu không thuộc ngưỡng nào hết
                                                                                    if (dataLast.arrRow.indexOf(index) == -1) {
                                                                                        dataLast.arrRow.push(index);
                                                                                    }
                                                                                    dataNew[index].dataValues.threshold_level = 0;
                                                                                    if (dataLast.arrRow.length == dataLast.affectedRows) {
                                                                                        //Gửi dữ liệu reatime cho client đang lắng nghe
                                                                                        socketService.SendDataToClient(io, dataPackage.data_stationType, dataPackage.pond_id, dataPackage.river_id, dataPackage.station_id, dataNew);
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                });
                                                                esp8266_nsp.emit("I_" + dataPackage.st_code, { STATUS: "OK" });
                                                            } else if (statusCode == HttpStatus.BAD_REQUEST) {
                                                                esp8266_nsp.emit("I_" + dataPackage.st_code, { STATUS: "FAIL" });
                                                            };
                                                        });
                                                    } else if (dataLast.error.length > 0) {
                                                        esp8266_nsp.emit("I_" + dataPackage.st_code, { STATUS: "FAIL" });
                                                    }
                                                });
                                        };
                                    });
                                });
                            } else {
                                esp8266_nsp.emit("I_" + dataPackage.st_code, { STATUS: "FAIL" });
                            }
                        } else {
                            esp8266_nsp.emit("I_" + dataPackage.st_code, { STATUS: "FAIL" });
                        }
                    } else {
                        esp8266_nsp.emit("I_" + dataPackage.st_code, { STATUS: "FAIL" });
                    }
                } else {
                    esp8266_nsp.emit("I_" + dataPackage.st_code, { STATUS: "NOTACCESS" });
                }
            });
        });
        socket.on('disconnect', function() {
            console.log("Disconnect socket esp8266")
        });
    }

}