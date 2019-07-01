var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.harvest.findAll({
            order: 'harvest_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(userId, stockingId, keyword = '', page = 0, pageSize, done){
        model.harvest.findAll({
            where:{
                user_id: userId,
                stocking_id: stockingId
            },
            order: 'harvest_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.harvest.findOne({where: {harvest_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByUserId: function(id, done){
        model.harvest.findAll({
            where: { user_id: id},
            order: 'harvest_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByStockingId: function(id, done){
        model.harvest.findAll({
            where: { stocking_id: id},
            order: 'harvest_id DESC'
        }).then(function(data){
            return done(data);
        });
    }, 

    MapHarvest: function(body, done){        
        var dataNew = {
           harvest_harvestDate: body.harvest_harvestDate,
           user_id: body.user_id,
           stocking_id: body.stocking_id,
        };
        model.harvest.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.harvest.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.harvest.update(dataNew,{
                where: {harvest_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.harvest.destroy({where:{harvest_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}