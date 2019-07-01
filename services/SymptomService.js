var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.symptom.findAll({order: 'symptom_id ASC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.symptom.findAll({
            // include: [{ all: true }], 
            where: { 
                $or: [
                    { symptom_description: {$like: '%'+keyword + '%'}}
                ]   
            },      
                order: 'symptom_id ASC'
        }).then(function(data){
            var dataList = {};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
        });
    },
    GetById: function(id, done){
        model.symptom.findOne({where: {symptom_id : id}})
        .then(function(data){
            return done(data);
        });  
    },
    GetBySickId: function(id, done){
        model.symptom.findAll({where: {sick_id : id}})
        .then(function(data){
            return done(data);
        });  
    },
    MapSymptom: function(body, done){        
        var dataNew = {
            sick_id: body.sick_id,
            symptom_name: body.agent_name,
            symptom_image: body.agent_image || null,
            symptom_description: body.agent_description || null,
        };
        model.symptom.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.symptom.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){       
        model.symptom.update(dataNew,{
                where: {symptom_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.symptom.destroy({where:{symptom_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}