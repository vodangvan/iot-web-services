var model = require('../models'),
    bcrypt = require('bcrypt-nodejs');
var HttpStatus = require('http-status-codes');
var Q = require("q");
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.station.findAll({ 
            order: 'station_id ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.station.findAll({
            where: { station_name: {$like: '%'+ keyword + '%'}},
            order: 'station_id ASC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.station.findOne({where: {station_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetBySinkId: function(id){
        var deferred = Q.defer();
        model.station.findAll({
            where: { sink_id: id},
            order: 'station_id ASC'
        }).then(function(data){
            deferred.resolve(data);
        });
        return deferred.promise;
    },

    GetByCode: function(code){
        var deferred = Q.defer();
        model.station.findOne({
            where: { 
                station_code: code
            }
        }).then(function(data){
            deferred.resolve(data);
        });
        return deferred.promise;
    },

    GetByPond: function(pond_id){
        var deferred = Q.defer();
        model.station.findAll({
            where: {pond_id: pond_id}
        }).then(function(data){
           deferred.resolve(data);
        });
        return deferred.promise;
    },

    GetListByRegion: function(region_id){
        var deferred = Q.defer();
        model.station.findAll({
            where: {region_id: region_id}
        }).then(function(data){
           deferred.resolve(data);
        });
        return deferred.promise;
    },

    /*GetListByArrRegionId: function(dataRegion){
        var deferred = Q.defer();
        var arrRegionId=[];
        dataRegion.forEach(function(region){
            arrRegionId.push(region.region_id);
            if(arrRegionId.length == dataRegion.length){
                model.station.findAll({
                    include:[                        
                        {model: model.pond, require: false, attributes: ['pond_description'], as: 'Pond'},
                        {model: model.river, require: false, attributes: ['river_name'], as: 'River'},
                        {model: model.region, require: false, attributes: ['region_name'], as: 'Region'},
                        {model: model.sink, require: false, attributes: ['sink_name'], as: 'Sink'}
                    ],
                    attributes: ['station_id', 'station_name', 'station_location', 'station_node', 'station_address', 'station_duration', 'station_updateStatus','station_latitude','station_longitude'],
                    where: { 
                        region_id: {
                            $in: arrRegionId
                        },
                        $or:[
                            {pond_id:{ $ne: null }},
                            {river_id:{ $ne: null}}
                        ]
                    },
                    order: 'station_id DESC'
                }).then(function(data){
                    deferred.resolve(data); 
                });
            }
        });
        return deferred.promise;
    },*/

    GetListByArrRegionId: function(dataRegion, keyword = '', page = 0, pageSize){
        var deferred = Q.defer();
        var arrRegionId=[];
        dataRegion.forEach(function(region){
            arrRegionId.push(region.region_id);
            if(arrRegionId.length == dataRegion.length){
                model.station.findAll({
                    include:[                        
                        {model: model.pond, require: false, attributes: ['pond_description'], as: 'Pond'},
                        {model: model.river, require: false, attributes: ['river_name'], as: 'River'},
                        {model: model.region, require: false, attributes: ['region_name'], as: 'Region'},
                        {model: model.sink, require: false, attributes: ['sink_name'], as: 'Sink'}
                    ],
                    attributes: [
                        'station_id', 
                        'station_name', 
                        'station_location', 
                        'station_node', 
                        'station_address', 
                        'station_duration', 
                        'station_updateStatus',
                        'isDelete'
                         //,
                         //'station_latitude',
                         //'station_longitude'
                         
                        
                        ],
                    where: { 
                        region_id: {
                            $in: arrRegionId
                        },
                        station_name: {$like: '%'+ keyword + '%'},
                        $or:[
                            {pond_id:{ $ne: null }},
                            {river_id:{ $ne: null}}
                        ]                        
                    },
                    order: 'station_id DESC'
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

    /*GetListByArrRegionIdForFarmer: function(userId, dataRegion){
        var deferred = Q.defer();
        var arrRegionId=[];
        dataRegion.forEach(function(region){
            arrRegionId.push(region.region_id);
            if(arrRegionId.length == dataRegion.length){
                var strQuery = "SELECT st.`station_id`, st.`station_name`, st.`station_node` ";
                strQuery += " FROM `station` as st ";
                strQuery += " WHERE (st.`region_id` IN ("+ arrRegionId.toString() +") AND st.`pond_id` IS NULL) AND (st.`pond_id` IS NOT NULL OR st.`river_id` IS NOT NULL)";
                strQuery += " OR st.`pond_id` IN (SELECT p.`pond_id` FROM `pond` as p WHERE p.`user_id` = :userId)"
                strQuery += " ORDER BY st.`station_id` ASC";
                model.sequelize.query(strQuery,{ replacements: { userId: userId }, type: model.sequelize.QueryTypes.SELECT })
                .then(function(data) {
                    deferred.resolve(data);
                });
            }
        });
        return deferred.promise;
    },*/

    GetListByArrRegionIdForFarmer: function(userId, dataRegion, keyword = '', page = 0, pageSize){
        var deferred = Q.defer();
        var arrRegionId=[];
        dataRegion.forEach(function(region){
            arrRegionId.push(region.region_id);
            if(arrRegionId.length == dataRegion.length){
                var strQuery = "SELECT st.`station_id`, st.`station_name`, st.`station_node` ";
                strQuery += " FROM `station` as st ";
                strQuery += " WHERE (st.`region_id` IN ("+ arrRegionId.toString() +") AND st.`pond_id` IS NULL) AND (st.`pond_id` IS NOT NULL OR st.`river_id` IS NOT NULL)";
                strQuery += " AND st.`station_name` LIKE :keyword ";
                strQuery += " OR st.`pond_id` IN (SELECT p.`pond_id` FROM `pond` as p WHERE p.`user_id` = :userId)";
                strQuery += " ORDER BY st.`station_id` ASC";
                model.sequelize.query(strQuery,{ replacements: { userId: userId, keyword: (keyword=="")?'%': '%'+keyword+'%' }, type: model.sequelize.QueryTypes.SELECT })
                .then(function(data) {
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

    //Kiểm tra mã xác định có tồn tại chưa.
    CheckCode: function(code){
        var deferred = Q.defer();
        model.station.findOne({where:{ station_code: code}}).then(function(data){                
            if(data)
                deferred.resolve(true);
            else
                deferred.resolve(false)
        });
        return deferred.promise;
    },
    
    //Kiểm tra xác thực trạm
    ValidateStation: function(code, secret){
        var deferred = Q.defer();
        model.station.findOne({where: {station_code : code, station_secret: secret}}).then(function(data){                
            if(data){
                var obj ={
                    flag: true,
                    data: data
                }
                deferred.resolve(obj);
            }            
            else{
                var obj ={
                    flag: false,
                    data: null
                }
                deferred.resolve(obj);
            }
        });          
        return deferred.promise;
    },
    GetStatus: function(code){
        var deferred = Q.defer();
        model.station.findOne({
            attributes: ['station_updateStatus'],
            where:{ station_code: code }
        }).then(function(data){
            deferred.resolve(data);
        });
        return deferred.promise;
    },
    
    MapStation: function(body, done){        
        var dataNew = {
            sink_id: body.sink_id || null,
            region_id: body.region_id,
            river_id: body.river_id || null,
            pond_id: body.pond_id || null,
            station_name: body.station_name,
            station_code: body.station_code,            
            station_secret: body.station_secret,
            station_address: body.station_address,
            station_location: body.station_location || null,
            station_node: body.station_node || null,
            station_status: body.station_status || true,
            station_duration: body.station_duration,
            station_updateStatus: body.station_updateStatus,
            station_latitude:body.station_latitude || 0,
            station_longitude:body.station_longitude || 0,
            isDelete: body.isDelete || false
        };
        model.station.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },        

    Add: function(dataNew, done){
        model.station.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.station.update(dataNew,{
                where: {station_id: id}
        }).then(function(data){
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.station.destroy({where:{station_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    isDelete: function(id,done){
        var strQuery = 'UPDATE `station` SET isDelete = 1 where station_id = ' + id ;
        model.sequelize.query(strQuery,{ type: model.sequelize.QueryTypes.UPDATE })
        .then(function(data){
            return done(data);
        });
    }
}
/** 
 * thêm mới 2 trường này
 * station_latitude: kinh độ thực trên bản đồ
 * station_longitude: vĩ độ thực trên bản đồ
 */