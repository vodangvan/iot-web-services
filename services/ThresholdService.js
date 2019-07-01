var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.threshold.findAll({
            order: 'threshold_id ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page=0, pageSize, done){
        model.threshold.findAll({ 
            where: { threshold_name: {$like: '%'+ keyword + '%'}},
            order: 'threshold_id ASC'
        }).then(function(data){
            var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.threshold.findOne({
             where: {threshold_id: id}}).then(function(data){                
            return done(data);
        });  
    },
    //Lấy danh sách ngưỡng theo loại số liệu
    GetListByDataType: function(id, done){
        model.threshold.findAll({
            where: { datatype_id: id}
        }).then(function(data){
            return done(data);
        });
    },
    //Lấy danh sách ngưỡng theo vùng
    GetListByRegion: function(id, done){
        model.threshold.findAll({
            where: { region_id: id}
        }).then(function(data){
            return done(data);
        });
    },

    //Lấy danh sách ngưỡng theo độ tuổi
    GetListByAge: function(id, done){
        model.threshold.findAll({
            where: { age_id: id}
        }).then(function(data){
            return done(data);
        });
    },

    //Lấy danh sách ngưỡng theo loài
    GetListBySpecies: function(id, done){
        model.threshold.findAll({
            where: { species_id: id}
        }).then(function(data){
            return done(data);
        });
    },

    //Lấy ra danh sách các ngưỡng theo 4 thông số: loại số liệu (datatype_id), độ tuổi (age_id), vùng nuôi (region_id), loài nuôi (species_id)
    GetListByData: function(datatype_id, age_id, region_id, species_id, done){
        model.threshold.findAll({
            where:{
                datatype_id: datatype_id,
                age_id: age_id,
                region_id: region_id,
                species_id: species_id
            }
        }).then(function(data){
            return done(data);
        });
    },

    GetListNameThreshold: function(done){
        model.threshold.findAll({
            attributes: ['threshold_id', 'threshold_name'],
            order: 'threshold_id'
        }).then(function(data){
            return done(data);
        });
    },

    MapThreshold: function(body, done){
        var dataNew = {
            datatype_id: body.datatype_id,
            age_id: body.age_id,
            region_id: body.region_id,
            species_id: body.species_id,        
            threshold_name: body.threshold_name,        
            threshold_start: body.threshold_start,
            threshold_end: body.threshold_end,                
            threshold_level: body.threshold_level,
            threshold_message:body.threshold_message,
            threshold_createdDate: body.threshold_createdDate,
            threshold_timeWarning: body.threshold_timeWarning || 30,
            threshold_type: body.threshold_type || null//0: sông, 1: ao, null khác
        };
        model.threshold.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.threshold.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.threshold_id = id;
        model.threshold.update(dataNew,{
                where: {threshold_id: id}
            }).then(function(error){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.threshold.destroy({where:{threshold_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }


    
}