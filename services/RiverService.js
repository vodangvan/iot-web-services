var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.river.findAll({order: 'river_name ASC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(arrRegionId, keyword = '', page = 0, pageSize, done){
        model.river.findAll({
            where: { 
                river_description: {$like: '%'+ keyword + '%'},
                region_id: {
                    $in: arrRegionId
                }
            },
            order: 'river_name ASC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.river.findOne({
            //  include:[{all: true}], 
             where: {river_id: id}
        }).then(function(data){                
            return done(data);
        });  
    },
   
    //Lấy danh sách sông theo địa chỉ
    GetListByRegion: function(id, done){
        model.river.findAll({
            where: { region_id: id}
        }).then(function(data){
            return done(data);
        });
    },

    //Lấy danh sách sông thuộc mảng các vùng
    GetListByRegionArray: function(arrRegionId, done){
        model.river.findAll({
            where:{
                region_id: {
                    $in: arrRegionId
                }
            },
            order: 'river_name ASC'
        }).then(function(data){
            return done(data);
        });
    },

    MapRiver: function(body, done){
        var dataNew = {
            region_id: body.region_id,
            river_name: body.river_name,
            river_description: body.river_description || null,                
            river_location: body.river_location || null,
            river_latitude: body.river_latitude || 0, // thêm mới
            river_longitude: body.river_longitude || 0, // thêm mới
            isDelete: body.isDelete || false 
        };
        model.river.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.river.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.river_id = id;
        model.river.update(dataNew,{
                where: {river_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.river.destroy({where:{river_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    isDelete: function(id,done){
        var strQuery = 'UPDATE `river` SET isDelete = 1 where river_id = ' + id ;
        model.sequelize.query(strQuery,{ type: model.sequelize.QueryTypes.UPDATE })
        .then(function(data){
            return done(data);
        });
    }    
}