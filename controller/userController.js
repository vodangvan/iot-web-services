var model = require('../models'),
    service = require('../services/Infrastructure'),
    userService = require('../services/UserService'),
    lockHistoryService = require('../services/LockHistoryService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    bcrypt = require('bcrypt-nodejs'),
    moment = require('moment'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    config = require('../config/config.json')[env];

function USER_CONTROLLER(routerUser) {
    var self = this;
    self.handleRoutes(routerUser);
}

USER_CONTROLLER.prototype.handleRoutes = function(routerUser) {
    var self = this;
    //Lấy toàn bộ danh sách người dùng
    // ********
    routerUser.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    //Lấy danh sách có phân trang
    routerUser.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            userService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });
    // My code here
    //Lấy danh sách id và tên có phân trang
    routerUser.get("/getshortpagi", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            userService.GetShortPagiByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách nông dân theo tên
    //Truyền vào là từ khóa, tìm kiếm theo user_username hoặc user_fullname
    // /getlistfarmer?keyword=...
    //Trả về danh sách user
    routerUser.get("/getlistfarmer", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.GetListByRole("farmers", req.query.keyword, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm người dùng theo id
    routerUser.get("/getbyid/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.GetById(req.params.user_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Tìm người dùng theo userName
    routerUser.get("/getbyname/:user_userName", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.GetByName(req.params.user_userName, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Hàm check mật khẩu mới có trùng lại mật khẩu hiện tại không
    //Nhận vào là user_id là id tài khoản,
    // newPassword là mật khẩu mới, truyền body
    // Nếu mật khẩu không trùng sẽ trả về data = null, nếu trùng sẽ trả về data = 1
    routerUser.post("/checkpass/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            userService.CheckPass(req.params.user_id, req.body.newPassword).then(function(data) {
                return service.CreateResponse(data.statusCode, res, data.data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới người dùng
    //Hàm nhận vào các tham số: 
    routerUser.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        if (body.user_password == null || body.user_password == undefined) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.passwordNotNull);
        } else {
            userService.MapUser(body, function(statusCode, data) {
                if (statusCode == HttpStatus.BAD_REQUEST)
                    return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
                else {
                    userService.Add(data, function(statusCode, user) {
                        return service.CreateResponse(statusCode, res, user);
                    });
                }
            });
        }
    });
    //Cập nhật thông tin người dùng
    routerUser.put("/update/:user_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        userService.MapUser(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                userService.Update(data, req.params.user_id, function(statusCode, user) {
                    return service.CreateResponse(statusCode, res, data);
                });
            }
        });
    });

    //Thay đổi mật khẩu người dùng
    //Nhận 3 tham số: oldPassword, newPassword, comparePassword
    routerUser.put("/changepassword/:user_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        if (body.newPassword == body.comparePassword && body.newPassword != null && body.newPassword) {
            userService.ChangePassword(req.params.user_id, body.oldPassword, body.newPassword).then(function(obj) {
                return service.CreateResponse(obj.statusCode, res, obj.data);
            }).catch(function(obj) {
                return service.CreateResponse(obj.statusCode, res, obj.data);
            });
        } else
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.accountCompareOldNewPass);
    });

    //Khóa tài khoản người dùng
    routerUser.put("/clockuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        body.lockhistory_lockDate = moment(new Date()).tz(config.timezoneDefault)._d;
        body.user_id = req.params.user_id;
        lockHistoryService.MapLockHistory(body, function(statusCode, dataLock) {
            if (statusCode == HttpStatus.OK) {
                userService.LockUser(req.params.user_id, function(statusCode, data) {
                    if (statusCode == HttpStatus.OK) {
                        lockHistoryService.Add(dataLock, function(statusCode, datalock) {
                            return service.CreateResponse(statusCode, res, datalock)
                        });
                    }
                    return service.CreateResponse(statusCode, res, data)
                });
            }
        });
    });

    //Mở khóa tài khoản người dùng
    routerUser.put("/unclockuser/:user_id", auth.isJwtAuthenticated, function(req, res) {
        userService.UnLockUser(req.params.user_id, function(statusCode, data) {
            return service.CreateResponse(statusCode, res, data)
        });
    });

    routerUser.post('/register', function(req, res) {
        var body = req.body;
        userService.GetRoleGuestID(function(data) {
            body.role_id = data;
            userService.MapUser(body, function(data) {
                model.user.build(data).validate().then(function(error) {
                    if (error)
                        return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
                    else {
                        userService.Add(data, function(statusCode, user) {
                            service.CreateResponse(statusCode, res, user);
                        });
                    }
                });
            });
        });
    });
}

module.exports = USER_CONTROLLER;