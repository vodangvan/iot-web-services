var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.stocking.findAll({
            order: 'stocking_date DESC'
        }).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(userId, keyword = '', page = 0, pageSize, done){
        model.stocking.findAll({
            where: { 
                stocking_note: {$like: '%'+ keyword + '%'},
                user_id: userId
            },
            order: 'stocking_date DESC'
        }).then(function(data){
            var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.stocking.findOne({where: {stocking_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetBySpeciesId: function(id, done){
        model.stocking.findAll({
            where: { species_id: id},
            order: 'stocking_date DESC'
        }).then(function(data){
            return done(data);
        });
    },

    // GetByAgeId: function(id, done){
    //     model.stocking.findAll({
    //         where: { age_id: id},
    //         order: 'stocking_date DESC'
    //     }).then(function(data){
    //         return done(data);
    //     });
    // },

    GetListByUser: function(userId, done){
        model.stocking.findAll({
            where: {
                user_id: userId
            },
            order: 'stocking_date DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapStocking: function(body, done){        
        var dataNew = {
           stockingtype_id: body.stockingtype_id,
           //age_id: body.age_id,
           species_id: body.species_id,
           user_id: body.user_id,
           stocking_quantity: body.stocking_quantity,
           stocking_date: body.stocking_date,
           stocking_status: body.stocking_status || true,
           stocking_note: body.stocking_note || ''
        };
        model.stocking.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.stocking.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.stocking.update(dataNew,{
                where: {stocking_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.stocking.destroy({where:{stocking_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}