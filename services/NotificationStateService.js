var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {

    GetById: function(notifId, userId, done){
        model.notification_state.findOne({
            where: {
                user_id : userId,
                notif_id: notifId
            }
        }).then(function(data){                
            return done(data);
        });  
    },

    CheckState: function(notifId, userId, done){
        model.notification_state.findOne({
            where: {
                user_id : userId,
                notif_id: notifId
            }
        }).then(function(data){     
            if(data)           
                return done(true);
            else
                return done(false);
        });  
    },

    GetListByUser: function(userId, done){
        model.notification_state.findAll({
            where:{
                user_id: userId
            }
        }).then(function(data){
            return done(data);
        });
    },

    GetListByNotifi: function(notifId, done){
        model.notification_state.findAll({
            where:{
                notif_id: notifId
            }
        }).then(function(data){
            return done(data);
        });
    },

    MapNotificationState: function(body, done){        
        var dataNew = {
            user_id: body.user_id,
            notif_id: body.notif_id,
            notifstate_readTime: body.notifstate_readTime
        };
        model.notification_state.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.notification_state.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, notifId, userId, done){
         model.notification_state.destroy({
             where:{
                 user_id : userId,
                 notif_id: notifId
            }
        }).then(function(data){
            return done(HttpStatus.OK, obj);
        }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}