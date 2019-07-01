var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.unit.findAll({
            order: 'unit_id ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.unit.findAll({
            where:{ unit_name: {$like: '%'+keyword + '%'}},
            order: 'unit_name ASC'
        }).then(function(data){
            var dataList = {};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.unit.findOne({where: {unit_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    MapUnit: function(body, done){        
        var dataNew = {
            unit_name: body.unit_name,
            unit_description: body.unit_description
        };
        model.unit.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.unit.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.unit.update(dataNew,{
                where: {unit_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.unit.destroy({where:{unit_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}