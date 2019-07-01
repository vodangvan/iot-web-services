var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.pond_preparation.findAll({
            order: 'pondpreparation_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.pond_preparation.findAll({
            order: 'pondpreparation_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.pond_preparation.findOne({where: {pondpreparation_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByPondId: function(id, done){
        model.pond_preparation.findAll({
            where: { pond_id: id},
            order: 'pondpreparation_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByStockingId: function(id, done){
        model.pond_preparation.findAll({
            where: { stocking_id: id},
            order: 'pondpreparation_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByStockingPond: function(stockingId, pondId, done){
        model.pond_preparation.findAll({
            where: {
                stocking_id: stockingId,
                pond_id: pondId
            },
            order: 'pondpreparation_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByLandBackgroundId: function(id, done){
        model.pond_preparation.findAll({
            where: { landbg_id: id},
            order: 'pondpreparation_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapPondPreparation: function(body, done){        
        var dataNew = {
           pond_id: body.pond_id,
           stocking_id: body.stocking_id,
           landbg_id: body.landbg_id,
           pondpreparation_dateStart: body.pondpreparation_dateStart,
           pondpreparation_soilPH: body.pondpreparation_soilPH,
           pondpreparation_capacityOfFan: body.pondpreparation_capacityOfFan,
           pondpreparation_quantityOfFan: body.pondpreparation_quantityOfFan,
        };
        model.pond_preparation.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.pond_preparation.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.pond_preparation.update(dataNew,{
                where: {pondpreparation_id: id}
            }).then(function(error){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.pond_preparation.destroy({where:{pondpreparation_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}