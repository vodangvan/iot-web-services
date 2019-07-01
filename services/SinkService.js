var model = require('../models'),
    bcrypt = require('bcrypt-nodejs');
var HttpStatus = require('http-status-codes');
var Q = require("q");
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.sink.findAll({order: 'sink_id ASC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.sink.findAll({
            where: {
                $or: [
                    { sink_name: {$like: '%'+ keyword + '%'}},
                    { sink_code: {$like: '%'+ keyword + '%'}}
                ]
        },
        order: 'sink_id ASC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.sink.findOne({where: {sink_id : id}}).then(function(data){                
            return done(data);
        });  
    },
    //Lấy danh sách theo vùng/khu vực
    GetByRegionId: function(id, done){
        model.sink.findAll({
            where: { region_id: id},
            order: 'sink_id ASC'
        });
    },

    GetByArrRegion: function(dataRegion, keyword = '', page = 0, pageSize){
        var deferred = Q.defer();
        var arrRegionId=[];
        dataRegion.forEach(function(region){
            arrRegionId.push(region.region_id);
            if(arrRegionId.length == dataRegion.length){
                model.sink.findAll({
                    where:{
                        region_id: {
                            $in: arrRegionId
                        },
                        sink_name: {$like: '%'+ keyword + '%'},
                    }
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


    GetListByArrRegionIdForFarmer: function(userId, dataRegion, keyword = '', page = 0, pageSize){
        var deferred = Q.defer();
        var arrRegionId=[];
        dataRegion.forEach(function(region){
            arrRegionId.push(region.region_id);
            if(arrRegionId.length == dataRegion.length){
                var strQuery = "SELECT snk.* ";
                strQuery += " FROM `station` as st JOIN `sink` AS snk ON st.`sink_id` = snk.`sink_id` ";
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
        model.sink.findAll({where:{ sink_code: code}}).then(function(data){                
            if(data)
                deferred.resolve(true);
            else
                deferred.resolve(false);
        });
        return deferred.promise;
    },

    //Kiểm tra xác thực trạm
    ValidateSink: function(sink_code, sink_secret){
        var deferred = Q.defer();
        model.sink.findOne({where: {sink_code : sink_code, sink_secret: sink_secret}}).then(function(data){                
            if(data)
                deferred.resolve(true);
            else
                deferred.resolve(false);
        });          
        return deferred.promise;
    },

    MapSink: function(body, done){
        
        var dataNew = {
            region_id: body.region_id,
            sink_name: body.sink_name,
            sink_code: body.sink_code || null,
            sink_secret: body.sink_secret || null,
            sink_location: body.sink_location || null,        
            sink_status: body.sink_status || true,
            sink_address: body.sink_address || null,
            sink_latitude:body.sink_latitude || 0,
            sink_longitude:body.sink_longitude || 0,
            isDelete: body.isDelete || false

        };
        model.sink.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(sinkNew, done){
        model.sink.create(sinkNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(sinkNew, id, done){
        sinkNew.sink_id = id;
        model.sink.update(sinkNew,{
                where: {sink_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, sinkNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(sink, id, done){
         model.sink.destroy({where:{sink_id: id}}).then(function(data){
            return done(HttpStatus.OK, sink);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    isDelete: function(id,done){
        var strQuery = 'UPDATE `sink` SET isDelete = 1 where sink_id = ' + id ;
        model.sequelize.query(strQuery,{ type: model.sequelize.QueryTypes.UPDATE })
        .then(function(data){
            return done(data);
        });
    }    
}
/** 
 * thêm mới 2 trường này
 * sink_latitude: kinh độ thực trên bản đồ
 * sink_longitude: vĩ độ thực trên bản đồ
 */