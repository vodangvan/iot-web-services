var model = require('../models'),
    service = require('../services/Infrastructure'),
    mediaService = require('../services/MediaService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    moment = require('moment'),
    config = require('../config/config.json')[env];


function MEDIA_CONTROLLER(routerMedia) {
    var self = this;
    self.handleRoutes(routerMedia);
}

MEDIA_CONTROLLER.prototype.handleRoutes = function(routerMedia) {
    var self = this;
    //Lấy danh sách
    /*routerMedia.get("/getall", auth.isJwtAuthenticated, function(req,res){
        try {
            mediaService.GetAll(function(data){
               return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });*/

    //Lấy danh sách có phân trang
    routerMedia.get("/getpagination", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            mediaService.GetAllByKeyword(params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerMedia.get("/getbyid/:media_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            mediaService.GetById(req.params.media_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo post
    routerMedia.get("/getbypost/:post_id", function(req, res) {
        try {
            mediaService.GetByPostId(req.params.post_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo bài viết và loại tập tin
    // type: 0: hình ảnh. 1: video, null: khác
    // /getbypostandtype/1?type=...
    routerMedia.get("/getbypostandtype/:post_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            mediaService.GetByPostAndType(req.params.post_id, req.query.type, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerMedia.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        mediaService.MapMedia(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                mediaService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Cập nhật thông tin 
    routerMedia.put("/update/:media_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        mediaService.MapMedia(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                mediaService.Update(data, req.params.media_id, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin 
    routerMedia.delete("/delete/:media_id", auth.isJwtAuthenticated, function(req, res) {
        mediaService.GetById(req.params.media_id, function(dataFind) {
            if (dataFind) {
                mediaService.Delete(dataFind, req.params.media_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });

    //Xóa tất các media của 1 post
    routerMedia.delete("/deletemulti/:post_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            mediaService.DeleteByPost(req.params.post_id, function(statusCode, data) {
                return service.CreateResponse(statusCode, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

}

module.exports = MEDIA_CONTROLLER;