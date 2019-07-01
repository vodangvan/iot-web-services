var model = require('../models'),
    service = require('../services/Infrastructure'),
    materialService = require('../services/MaterialService'),
    HttpStatus = require('http-status-codes'),
    auth = require('../auth'),
    env = process.env.NODE_ENV || 'development',
    messageConfig = require('../config/messageConfig.json'),
    billService = require('../services/BillService'),
    config = require('../config/config.json')[env];


function MATERIAL_CONTROLLER(routerMaterial) {
    var self = this;
    self.handleRoutes(routerMaterial);
}

MATERIAL_CONTROLLER.prototype.handleRoutes = function(routerMaterial) {
    var self = this;
    //Lấy danh sách
    routerMaterial.get("/getall", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialService.GetAll(function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    /*
    //Lấy danh sách có phân trang theo user_id
     //Truyền vào các tham số
            user_id: là id của người dùng, truyền dạng params
            page: trang hiện tại
            pageSize: kích thước lấy
            keyword: từ khóa tìm kiếm theo material_name
            3 biến trên truyền theo dạng query
        url: /getpagination/:user_id?page=...&pageSize=...&keyword=...
        Trả về là danh sách gồm pageSize phần tử, bắt đầu từ vị trí page*pageSize
        Và thông tin tổng số phần tử, số trang đã chia.
    */
    routerMaterial.get("/getpagination/:user_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            var params = req.query;
            var page = params.page;
            var pageSize = params.pageSize || config.pageSizeDefault;
            materialService.GetAllByKeyword(req.params.user_id, params.keyword, page, pageSize, function(data) {
                service.PaginationSet(data, data.totalRow, params.page, pageSize, function(dataNew) {
                    return service.CreateResponse(HttpStatus.OK, res, dataNew);
                });
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    routerMaterial.get("/getbystocking/:stocking_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialService.GetByStocking(req.params.stocking_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy thông tin theo ID
    routerMaterial.get("/getbyid/:material_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialService.GetById(req.params.material_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo loại vật liệu
    routerMaterial.get("/getbymaterialtype/:materialtype_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialService.GetByMaterialTypeId(req.params.materialtype_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Lấy danh sách theo bill_id
    routerMaterial.get("/getbybill/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        try {
            materialService.GetByBillId(req.params.bill_id, function(data) {
                return service.CreateResponse(HttpStatus.OK, res, data);
            });
        } catch (error) {
            return service.CreateResponse(HttpStatus.BAD_REQUEST, res, error);
        }
    });

    //Thêm mới thông tin
    routerMaterial.post("/create", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        materialService.MapMaterial(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                materialService.Add(data, function(statusCode, dataNew) {
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    /*
        //Thêm mới nhiều material cho một bill
        - Dùng để thêm mới danh sách các other vào một bill
        - Nhận bill_id theo dạng params
        - Nhận vào id của bill và danh sách các other truyền qua body theo dạng đối tượng
        {
            bill_id: ...,
            materials: [
                {
                    materialtype_id: ...,
                    unit_id: ...,
                    material_name: ...,
                    material_numberOfLot: ...,
                    material_source: ...,
                    material_quantity: ...,
                    material_existence: ...,
                    material_price: ...,
                    material_description: ...,
                    material_state: ...,
                },
                {...},
                {...}
            ]
        }
    */
    routerMaterial.post("/createmulti/:bill_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        billService.GetById(req.params.bill_id, function(billData) {
            if (billData && body.materials) {
                materialService.MapMaterialArray(body, function(statusCode, arrData) {
                    if (statusCode == HttpStatus.OK) {
                        materialService.AddMulti(arrData, function(statusCode2, data) {
                            return service.CreateResponse(statusCode2, res, data);
                        });
                    } else {
                        return service.CreateResponse(statusCode, res, arrData);
                    }
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, messageConfig.objNotExist);
            }
        });
    });

    //Cập nhật thông tin 
    routerMaterial.put("/update/:material_id", auth.isJwtAuthenticated, function(req, res) {
        var body = req.body;
        materialService.MapMaterial(body, function(statusCode, data) {
            if (statusCode == HttpStatus.BAD_REQUEST)
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, data);
            else {
                materialService.Update(data, req.params.material_id, function(statusCode, dataNew) {
                    if (statusCode == HttpStatus.OK) {
                        billService.UpdateTotal(body.bill_id, function(statusCode, dataTotal) {});
                    }
                    return service.CreateResponse(statusCode, res, dataNew);
                });
            }
        });
    });

    //Xóa thông tin một
    routerMaterial.delete("/delete/:material_id", auth.isJwtAuthenticated, function(req, res) {
        materialService.GetById(req.params.material_id, function(dataFind) {
            if (dataFind) {
                materialService.Delete(dataFind, req.params.material_id, function(statusCode, data) {
                    return service.CreateResponse(statusCode, res, data)
                });
            } else {
                return service.CreateResponse(HttpStatus.BAD_REQUEST, res, { "type": messageConfig.notFound, "message": messageConfig.objNotExist });
            }
        });
    });


}

module.exports = MATERIAL_CONTROLLER;