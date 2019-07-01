
var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {
    
    //========================Tỉnh/Thành phố==============================//
    //Lấy danh sách tỉnh/thành phố
    GetAllProvince: function(done){
        model.province.findAll({
            order: 'province_name ASC'}).then(function(data){                
            return done(data);
            });
    },
     //Lấy danh sách theo tên
    GetAllProvinceByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.province.findAll({
            where: {province_name: {$like: '%'+ keyword + '%'}},    
            order: 'province_name ASC'
        }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },
    //Lấy tỉnh/tp theo ID
    GetProvinceById: function(id, done){
        model.province.findOne({where: {province_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    //===============================Quận huyện==========================================//
    //Lấy danh sách quận huyện
    GetAllDistrict: function(done){
        model.district.findAll({
            order: 'district_name ASC'}).then(function(data){                
            return done(data);
            });
    },
     //Lấy danh sách theo tên
    GetAllDistrictByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.district.findAll({
            where: {district_name: {$like: '%'+ keyword + '%'}},    
            order: 'district_name ASC'
        }).then(function(data){
        var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },
    //Lấy quận/huyện theo ID
    GetDistrictById: function(id, done){
        model.district.findOne({where: {district_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    //Lấy danh sách quận huyện theo tỉnh/thành phố
    GetDistrictByProvinceId: function(id, done){
        model.district.findAll({
            where: {province_id : id}
        }).then(function(data){                
            return done(data);
        });  
    },
    

    //==========================Xã phường =======================//
    //Lấy danh sách xã phường
    GetAllWard: function(done){
        model.ward.findAll({
            order: 'ward_name ASC'
        }).then(function(data){                
            return done(data);
        });
    },
     //Lấy danh sách theo tên
    GetAllWardByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.ward.findAll({
            where: {ward_name: {$like: '%'+ keyword + '%'}},    
            order: 'ward_name ASC'
        }).then(function(data){
        var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },
    //Lấy xã phường theo ID
    GetWardById: function(id, done){
        model.ward.findOne({where: {ward_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    //Lấy danh sách xã phường theo quận huyện
    GetWardByDistrictId: function(id, done){
        model.ward.findAll({
            where: {district_id : id}
        }).then(function(data){                
            return done(data);
        });  
    },

    //Lấy ra danh sách vùng quản lý của một user
    //Truyền vào là danh sách ID của location tương ứng cấp quản lý
    // managerLevel: 1 nếu quản lý các tỉnh (cấp bộ trung ương),
    // 2: Quản lý các huyện (cấp tỉnh)
    // 3: Quản lý các xã (cấp huyện)
    // 4: Quản lý các vùng (cấp xã)
    GetListRegionManager: function(arrLocationId, managerLevel, keyword = '', page = 0, pageSize = -1){
        var deferred = Q.defer();
        var strQuery = "SELECT DISTINCT r.`region_id`, r.`region_name`, w.`ward_name`";
        var arrID = [];
        var resultIndex=[];
        arrLocationId.forEach(function(item, index){
            arrID.push(item.dataValues.locaman_locationId);
            if(arrID.length == arrLocationId.length){
                if(managerLevel == 1){            
                    strQuery +="FROM `region` AS r JOIN `ward` AS w ON r.`ward_id` = w.`ward_id` JOIN `district` AS di ON w.`district_id` = di.`district_id` JOIN `province` AS pr ON di.`province_id` = pr.`province_id` AND pr.`province_id` IN ("+ arrID.toString() +") ";
                    strQuery +=" WHERE r.`region_name` LIKE '%" + keyword + "%'";
                    strQuery += "ORDER BY r.`region_name` ASC;"
                }else if(managerLevel == 2){
                    strQuery +="FROM `region` AS r JOIN `ward` AS w ON r.`ward_id` = w.`ward_id` JOIN `district` AS di ON w.`district_id` = di.`district_id` AND di.`district_id` IN ("+ arrID.toString() +") ";
                    strQuery +=" WHERE r.`region_name` LIKE '%" + keyword + "%' ";
                    strQuery += "ORDER BY r.`region_name` ASC;"
                }else if(managerLevel == 3){
                    strQuery +="FROM `region` AS r JOIN `ward` AS w ON r.`ward_id` = w.`ward_id` AND w.`ward_id` IN ("+ arrID.toString() +") ";
                    strQuery +=" WHERE r.`region_name` LIKE '%" + keyword + "%' ";
                    strQuery += "ORDER BY r.`region_name` ASC;"
                }else if(managerLevel == 4){
                    strQuery +="FROM `region` AS r LEFT JOIN `ward` AS w ON r.`ward_id` = w.`ward_id`";
                    strQuery +="WHERE r.`region_id` IN ("+ arrID.toString() +") AND r.`region_name` LIKE '%" + keyword + "%'";
                    strQuery += "ORDER BY r.`region_name` ASC;"
                }
                model.sequelize.query(strQuery,{ type: model.sequelize.QueryTypes.SELECT })
                .then(function(data) {
                    var dataList = {};
                    if(pageSize == -1){
                        dataList = data;
                        deferred.resolve(dataList); 
                    }else{
                        dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                        dataList.totalRow = data.length;
                        deferred.resolve(dataList); 
                    }  
                });
            }
        });
        return deferred.promise;
    }
}