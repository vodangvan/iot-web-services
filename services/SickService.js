var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.sick.findAll({order: 'sick_id DESC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.sick.findAll({
            // include: [{ all: true }], 
            where: { 
                $or: [
                    { sick_description: {$like: '%'+keyword + '%'}}
                ]   
            },      
                order: 'sick_id ASC'
        }).then(function(data){
            var dataList = {};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.sick.findOne({where: {sick_id : id}})
        .then(function(data){
            return done(data);
        });  
    },

    MapSick: function(body, done){        
        var dataNew = {
            stocking_id: body.stocking_id,
            pond_id: body.pond_id,
            sick_name: body.sick_name,
            sick_image: body.sick_image,
            sick_description: body.sick_description,
            sick_createdDate: body.sick_createdDate,
           
        };
        model.sick.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.sick.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){       
        model.sick.update(dataNew,{
                where: {sick_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.sick.destroy({where:{sick_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}