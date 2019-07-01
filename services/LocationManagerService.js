var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {

    GetById: function(id, done){
        model.location_manager.findOne({where: {locaman_id : id}}).then(function(data){                
            return done(data);
        });
    },

    GetByUser: function(user, done){
        model.location_manager.findAll({
            where:{
                user_id : user.user_id,
                locaman_endDate: null,
                locaman_levelManager: user.user_levelManager
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    GetListIDByUser: function(user, done){
        model.location_manager.findAll({
            attributes:['locaman_locationId'],
            where:{
                user_id : user.user_id,
                locaman_endDate: null,
                locaman_levelManager: user.user_levelManager
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    MapLocationManager: function(body, done){        
        var dataNew = {
            locaman_locationId: body.locaman_locationId,
            locaman_startDate: body.locaman_startDate,
            locaman_endDate: body.locaman_endDate || null,
            locaman_levelManager: body.locaman_levelManager,
            user_id: body.user_id
        };
        model.location_manager.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.location_manager.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.locaman_id = id;
        model.location_manager.update(dataNew,{
                where: {locaman_id: id}
            }).then(function(error){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.location_manager.destroy({where:{locaman_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    RemoveManager: function(endDate, id, done){
        model.location_manager.update({
            locaman_endDate: endDate
        },{
            where:{
                locaman_id: id
            }
        }).then(function(data){   
            return done(HttpStatus.OK, id);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}