var HttpStatus = require('http-status-codes');
var model = require('../models'),
    bcrypt = require('bcrypt-nodejs'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig'),
    Q = require('q'),
    config = require('../config/config')[env];
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done) {
        model.user.findAll({
            order: 'user_id ASC',
            attributes: ['user_id', 'user_fullName', 'user_userName']
        }).then(function(data) {
            return done(data);
        });
    },
    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done) {
        model.user.findAll({
            where: {
                $or: [
                    { user_fullName: { $like: '%' + keyword + '%' } },
                    { user_userName: { $like: '%' + keyword + '%' } }
                ]
            },
            order: 'user_id ASC'
        }).then(function(data) {
            var dataList = {};
            dataList = data.slice(parseInt(page) * parseInt(pageSize), parseInt(page) * parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);
        });
    },
    //Lấy dữ liệu chỉ có id và tên theo keyword có phân trang
    GetShortPagiByKeyword: function(keyword = '', page = 0, pageSize, done) {
        model.user.findAll({
            where: {
                $or: [
                    { user_fullName: { $like: '%' + keyword + '%' } },
                    { user_userName: { $like: '%' + keyword + '%' } }
                ]
            },
            order: 'user_id ASC',
            attributes: ['user_id', 'user_fullName', 'user_userName', 'role_id']
        }).then(function(data) {
            var dataList = {};
            dataList = data.slice(parseInt(page) * parseInt(pageSize), parseInt(page) * parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);
        });
    },

    GetListByRole: function(roleName, keyword = '', done) {
        model.user.findAll({
            include: [
                { model: model.role, where: { role_name: roleName }, require: true, as: 'Role' }
            ],
            attributes: ['user_id', 'user_fullName', 'user_userName', 'user_birthday', 'user_phone', 'user_email', 'user_address', 'user_lockStatus'],
            where: {
                $or: [
                    { user_fullName: { $like: '%' + keyword + '%' } },
                    { user_userName: { $like: '%' + keyword + '%' } }
                ]
            }
        }).then(function(data) {
            return done(data);
        });
    },
    GetAllFunction: function(done) {

    },
    GetById: function(id, done) {
        model.user.findOne({ where: { user_id: id } }).then(function(data) {
            return done(data);
        });
    },

    CheckPass(user_id, newPass) {
        var deferred = Q.defer();
        model.user.findOne({ where: { user_id: user_id } }).then(function(data) {
            var user = data;
            if (!user) {
                var obj = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: messageConfig.accountNotExist
                };
                deferred.resolve(obj);
            } else {
                bcrypt.compare(newPass, user.user_password, function(err, response) {
                    if (err) {
                        var obj = {
                            statusCode: HttpStatus.BAD_REQUEST,
                            data: err
                        };
                        deferred.resolve(obj);
                    } else if (!response) {
                        var obj = {
                            statusCode: HttpStatus.OK,
                            data: null
                        }
                        deferred.resolve(obj);
                    } else {
                        var obj = {
                            statusCode: HttpStatus.OK,
                            data: 1
                        }
                        deferred.resolve(obj);
                    };
                });
            };
        });
        return deferred.promise;
    },

    GetByName: function(userName, done) {
        model.user.findOne({ where: { user_userName: userName } }).then(function(data) {
            return done(data);
        });
    },
    //Note....
    GetFuncsByID: function(user_id, done) {
        model.user_function.findAll({
            where: { user_id: user_id }
        }).then(function(data) {
            return done(data);
        })
    },

    MapUser: function(body, done) {

        var dataNew = {
            user_fullName: body.user_fullName,
            user_userName: body.user_userName,
            user_birthday: body.user_birthday || null,
            user_phone: body.user_phone,
            user_email: body.user_email || null,
            user_address: body.user_address || null,
            user_onlineStatus: body.user_onlineStatus || false,
            user_sendSms: body.user_sendSms || false,
            role_id: body.role_id,
            user_levelManager: body.user_levelManager,
            user_lockStatus: body.user_lockStatus || false,
        };
        if (body.user_password) {
            var passwordHas = bcrypt.hashSync(body.user_password);
            dataNew.user_password = passwordHas;
        }

        model.user.build(dataNew).validate().then(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
            else {
                return done(HttpStatus.OK, dataNew);
            }
        });
    },

    GetRoleGuestID: function(done) {
        model.role.findOne({ where: { role_name: config.roleNameDefault } }).then(function(data) {
            if (data) {
                return done(data.role_id);
            }
        });
    },

    ChangePassword: function(user_id, oldPass, newPass) {
        var deferred = Q.defer();
        model.user.findOne({ where: { user_id: user_id } }).then(function(data) {
            var user = data;
            if (!user) {
                var obj = {
                    statusCode: HttpStatus.BAD_REQUEST,
                    data: messageConfig.accountNotExist
                };
                deferred.reject(obj);
            } else {
                bcrypt.compare(oldPass, user.user_password, function(err, response) {
                    if (err) {
                        var obj = {
                            statusCode: HttpStatus.BAD_REQUEST,
                            data: err
                        };
                        deferred.reject(obj);
                    } else if (!response) {
                        var obj = {
                            statusCode: HttpStatus.BAD_REQUEST,
                            data: messageConfig.accountPassIncorrect
                        };
                        deferred.reject(obj);
                    } else {
                        model.user.update({ user_password: bcrypt.hashSync(newPass) }, {
                            where: {
                                user_id: user_id
                            }
                        }).then(function(data) {
                            var obj = {
                                statusCode: HttpStatus.OK,
                                data: messageConfig.updateSuccess
                            };
                            deferred.resolve(obj);
                        });
                    };
                });
            };
        });
        return deferred.promise;
    },

    Add: function(userNew, done) {
        model.user.create(userNew).then(function(data) {
            return done(HttpStatus.CREATED, data);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(userNew, id, done) {
        userNew.user_id = id;
        model.user.update(userNew, {
            where: { user_id: id }
        }).then(function(data) {
            return done(HttpStatus.OK, userNew);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(user, id, done) {
        model.user.destroy({ where: { user_id: id } }).then(function(data) {
            return done(HttpStatus.OK, user);
        }).catch(function(error) {
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    LockUser: function(userid, done) {
        model.user.update({ user_lockStatus: true }, {
            where: {
                user_id: userid
            }
        }).then(function(error) {
            if (error != true)
                return done(HttpStatus.BAD_REQUEST, error);
            else
                return done(HttpStatus.OK, userid);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    UnLockUser: function(userid, done) {
        model.user.update({ user_lockStatus: false }, {
            where: { user_id: userid }
        }).then(function(error) {
            if (error != true)
                return done(HttpStatus.BAD_REQUEST, error);
            else
                return done(HttpStatus.OK, userid);
        }).catch(function(error) {
            if (error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },


}