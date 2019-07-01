var model = require('../models');
var HttpStatus = require('http-status-codes');
var notificationService = require('./NotificationService'),
    locationManagerService = require('./LocationManagerService'),
    locationService = require('./LocationService');
var Q = require('q');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.region.findAll({
            order: 'region_id ASC'
        }).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.region.findAll({
            where: {
                $or: [
                    { region_name: {$like: '%'+ keyword + '%'}},
                    { region_description: {$like: '%'+ keyword + '%'}}
                ]
        },
        order: 'region_id ASC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.region.findOne({where: {region_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByWardId: function(id, done){
        model.region.findAll({
            where: { ward_id: id},
            order: 'region_id ASC'
        }).then(function(data){
            return done(data);
        });
    },

    //Lấy danh sách vùng/ khu vực do user có id quản lý
    GetListManagerRegion: function(id, done){
        model.region_manager.findAll({
            where: { user_id: id}
        }).then(function(data){
            return done(data);
        });
    },

    GetListByUser: function(dataUser){
        var deferred = Q.defer();
        var arrLevel = [1, 2, 3, 4];
        var arrRegionId = [];
        if(dataUser){
            if(arrLevel.indexOf(dataUser.dataValues.user_levelManager)>=0){     //Kiểm tra có phải là người quản lý
                locationManagerService.GetListIDByUser(dataUser, function(dataArray){    
                    locationService.GetListRegionManager(dataArray, dataUser.user_levelManager, '', 0, -1).then(function(dataRegion){                      
                        deferred.resolve(dataRegion);
                    });                   
                });
            }else if(arrLevel.indexOf(dataUser.user_levelManager) == -1){
                this.GetListByUserAndPond(dataUser.dataValues.user_id, '', 0, -1).then(function(dataRegion){
                        deferred.resolve(dataRegion);
                });
            }
        }else{
                deferred.resolve(null);
        }   
        return deferred.promise;
    },
 
    GetListByUserAndPond: function(userId, keyword, page = 0, pageSize = -1){
        var deferred = Q.defer();
        var strQuery ="SELECT DISTINCT r.`region_id`, r.`region_name`, w.`ward_name`";
            strQuery +="FROM `user` AS u JOIN `pond` AS p ON u.`user_id` = p.`user_id` JOIN `region` AS r ON r.`region_id` = p.`region_id` LEFT JOIN `ward` AS w ON r.`ward_id` = w.`ward_id` ";
            strQuery +="WHERE u.`user_id` = :userID AND r.`region_name` LIKE :keyword ";
        model.sequelize.query(strQuery,{ replacements: { userID: userId, keyword: (keyword=="")?'%': '%'+keyword+'%'}, type: model.sequelize.QueryTypes.SELECT })
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
        return deferred.promise;
    },

    //Lấy danh sách người quản lý của region có id
    GetListManager: function(id, done){
        model.region_manager.findAll({
            where: { region_id: id}
        }).then(function(data){
            return done(data);
        });
    },

    MapRegion: function(body, done){
        var dataNew = {
            region_name: body.region_name,    
            region_description: body.region_description || null,
            ward_id: body.ward_id
        };
        model.region.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    MapRegionManager: function(body, done){
        var dataNew = {
            user_id: body.user_id,    
            region_id: body.region_id
        };
        model.region_manager.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },
    DeleteRegionManage: function(region_id, done){
        model.region_manager.destroy({where:{region_id: region_id}}).then(function(data){
               
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Add: function(dataNew, done){
        model.region.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    AddManager: function(dataNew, done){
        model.region_manager.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.region_id = id;
        model.region.update(dataNew,{
                where: {region_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.region.destroy({where:{region_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }


    
}