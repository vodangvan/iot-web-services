var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.activity_type.findAll({order: 'actitype_id ASC'}).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.activity_type.findAll({
            where: { 
                    actitype_name: {$like: '%'+keyword + '%'}
            },      
                order: 'actitype_id ASC'
        }).then(function(data){
            var dataList = {};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.activity_type.findOne({where: {actitype_id : id}}).then(function(data){                
            return done(data);
        }).then(function(data){
            return done(data);
        });  
    },

    MapActivityType: function(body, done){        
        var dataNew = {
            actitype_name: body.actitype_name
        };
        model.activity_type.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.activity_type.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.actitype_id = id;
        model.activity_type.update(dataNew,{
                where: {actitype_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.activity_type.destroy({where:{actitype_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}