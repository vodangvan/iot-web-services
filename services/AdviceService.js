var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.advice.findAll({order: 'advice_createdDate DESC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.advice.findAll({
            include: [
                {model: model.threshold, attributes: ['threshold_name'], as: 'Threshold'},
                {model: model.user, attributes: ['user_fullName'], as: 'User'}
            ],
            where: { advice_message: {$like: '%'+ keyword + '%'}},
            order: 'advice_createdDate DESC'
        }).then(function(data){
            var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.advice.findOne({where: {advice_id : id}}).then(function(data){                
            return done(data);
        });  
    },
    
    GetByUserId: function(id, keyword = '', page = 0, pageSize = -1, done){
        model.advice.findAll({
            include: [
                {model: model.threshold, attributes: ['threshold_name'], as: 'Threshold'}
            ],
            where: { 
                user_id: id,
                advice_title: {$like: '%'+ keyword + '%'}
            },
            order: 'advice_createdDate DESC'
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

    GetByThresholdId: function(id, done){
        model.advice.findAll({
            where: { threshold_id: id},
            order: 'advice_createdDate DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapAdvice: function(body, done){        
        var dataNew = {
           user_id: body.user_id,
           threshold_id: body.threshold_id,
           advice_title: body.advice_title || null,
           advice_message: body.advice_message,
           advice_createdDate: body.advice_createdDate
        };
        model.advice.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.advice.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.advice.update(dataNew, {
                where: {advice_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.advice.destroy({where:{advice_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}