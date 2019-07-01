var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require("q");
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.pond.findAll({
            order: 'pond_id ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.pond.findAll({
            where: { pond_description: {$like: '%'+ keyword + '%'}},
            order: 'pond_id ASC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.pond.findOne({ 
            where: {pond_id: id}
        }).then(function(data){                
            return done(data);
        });  
    },
    //Lấy danh sách ao theo người dùng
    GetListByUser: function(id, keyword = '', page = 0, pageSize = -1, done){
        model.pond.findAll({
            where: { 
                user_id: id,
                pond_description: { $like: '%'+ keyword + '%'}
            },
            order: 'pond_description ASC'
        }).then(function(data){
            var dataList={};
            if(pageSize == -1){
                dataList = data;
                return done(dataList); 
            }else{
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList); 
            }   
        });
    },

    GetListRegionIdByUser: function(userid, done){
        model.pond.findAll({
            attributes:['region_id'],
            where:{
                user_id: userid
            }
        }).then(function(data){
            return done(data);
        });
    },

    GetUserByPondId: function(pondId){
        var deferred = Q.defer();
        model.pond.findOne({
            where: {
                pond_id: pondId
            }
        }).then(function(pondData){
            if(pondData.user_id){
                model.user.findOne({
                    where:{
                        user_id: pondData.user_id
                    }
                }).then(function(userData){
                    deferred.resolve(userData);
                });
            }else{
                deferred.resolve(null);
            }
        });
        return deferred.promise;
    },

    //Lấy danh sách ao theo địa chỉ
    GetListByRegion: function(region_id, done){
        model.pond.findAll({
            where: { region_id: region_id}
        }).then(function(data){
            return done(data);
        });
    },

    GetListByArrRegion: function(dataRegion, keyword = '', page = 0, pageSize = -1){ 
        var deferred = Q.defer();
        var arrRegionId=[];
        dataRegion.forEach(function(region){
            arrRegionId.push(region.region_id);
            if(arrRegionId.length == dataRegion.length){
                model.pond.findAll({
                    include:[                        
                        {model: model.user, require: false, attributes: ['user_fullName'], as: 'User'},
                        {model: model.region, require: false, attributes: ['region_name'], as: 'Region'}
                    ],                    
                    where: { 
                        region_id: {
                            $in: arrRegionId
                        },
                        pond_description:{$like: '%'+ keyword + '%'},
                    },
                    order: 'pond_description ASC'
                }).then(function(data){
                    var dataList={};
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
    },

    MapPond: function(body, done){
        var dataNew = {
            region_id: body.region_id,
            user_id: body.user_id,
            pond_width: body.pond_width || 0,        
            pond_height: body.pond_height || 0,        
            pond_depth: body.pond_depth || 0,
            pond_description: body.pond_description || null,                
            pond_status: body.pond_status || true,
            pond_location: body.pond_location || null,
            pond_address:body.pond_address || null,
            pond_latitude:body.pond_latitude || 0,
            pond_longitude:body.pond_longitude || 0,
            isDelete: body.isDelete || false
         
        };
        model.pond.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.pond.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.pond_id = id;
        model.pond.update(dataNew,{
                where: {pond_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.pond.destroy({where:{pond_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    isDelete: function(id,done){
        var strQuery = 'UPDATE `pond` SET isDelete = 1 where pond_id = ' + id ;
        model.sequelize.query(strQuery,{ type: model.sequelize.QueryTypes.UPDATE })
        .then(function(data){
            return done(data);
        });
    }    
}