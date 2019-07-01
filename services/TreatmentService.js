var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.treatment.findAll({order: 'treatment_id ASC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.treatment.findAll({
            // include: [{ all: true }], 
            where: { 
                $or: [
                    { treatment_description: {$like: '%'+keyword + '%'}}
                ]   
            },      
                order: 'treatment_id ASC'
        }).then(function(data){
            var dataList = {};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.treatment.findOne({where: {treatment_id : id}})
        .then(function(data){
            return done(data);
        });  
    },
    GetBySickId: function(id, done){
        model.treatment.findAll({where: {sick_id : id}})
        .then(function(data){
            return done(data);
        });  
    },

    MapTreatment: function(body, done){        
        var dataNew = {
            sick_id: body.sick_id,
            treatment_name: body.treatment_name ,
            treatment_description: body.treatment_description || null,
        };
        model.treatment.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.treatment.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){       
        model.treatment.update(dataNew,{
                where: {treatment_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.treatment.destroy({where:{treatment_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}