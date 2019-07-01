var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.stocking_pond.findAll({
            order: 'stocking_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(stockingId, keyword = '', page = 0, pageSize, done){       
        model.stocking_pond.findAll({
            where: {
                stocking_id: stockingId
            },
            order: 'stocking_id DESC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetDetail: function(stockingId, pondId, done){
        model.stocking_pond.findOne({
            where: {
                stocking_id : stockingId,
                pond_id: pondId
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    GetByStockingId: function(id, done){
        model.stocking_pond.findAll({
            where: { stocking_id: id},
            order: 'stockpond_date DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByPondId: function(id, done){
        model.stocking_pond.findAll({
            where: { pond_id: id},
            order: 'stocking_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetBySeedId: function(id, done){
        model.stocking_pond.findAll({
            where: { seed_id: id},
            order: 'stocking_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapStockingPond: function(body, done){        
        var dataNew = {
           stocking_id: body.stocking_id,
           pond_id: body.pond_id,
           seed_id: body.seed_id,
           stockpond_date: body.stockpond_date,
           stockpond_age: body.stockpond_age,
           stockpond_PCR: body.stockpond_PCR,
           stockpond_PCRresult: body.stockpond_PCRresult || null,
           stockpond_density: body.stockpond_density,
           stockpond_quantityStock: body.stockpond_quantityStock,
           stockpond_statusOfSeed: body.stockpond_statusOfSeed,
           stockpond_method: body.stockpond_method || null,
           stockpond_depth: body.stockpond_depth,
           stockpond_clarity: body.stockpond_clarity,
           stockpond_salinity: body.stockpond_salinity,
           stockpond_DO: body.stockpond_DO,
           stockpond_PHwater: body.stockpond_PHwater,
           stockpond_tempAir: body.stockpond_tempAir,
           stockpond_tempWater: body.stockpond_tempWater,
           stockpond_state: body.stockpond_state
        };
        model.stocking_pond.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.stocking_pond.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, stockingId, pondId, done){
        model.stocking_pond.update(dataNew,{
                where: {
                    stocking_id: stockingId,
                    pond_id: pondId
                }
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    UpdateState: function(pondId, done){
        model.stocking_pond.update({stockpond_state: false},{
            where: {
                pond_id: pondId,
                stockpond_state: true
            }
        }).then(function(data){
            return done(HttpStatus.OK, true);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, stockingId, pondId, done){
         model.stocking_pond.destroy({
            where:{
                stocking_id: stockingId,
                pond_id: pondId
            }
        }).then(function(data){
            return done(HttpStatus.OK, obj);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}