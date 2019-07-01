var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.agent.findAll({order: 'agent_id ASC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.agent.findAll({
            // include: [{ all: true }], 
            where: { 
                $or: [
                    { agent_description: {$like: '%'+keyword + '%'}}
                ]   
            },      
                order: 'agent_id ASC'
        }).then(function(data){
            var dataList = {};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.agent.findOne({where: {agent_id : id}})
        .then(function(data){
            return done(data);
        });  
    },

    GetBySickId: function(id, done){
        model.agent.findAll({where: {sick_id : id}})
        .then(function(data){
            return done(data);
        });  
    },

    MapAgent: function(body, done){        
        var dataNew = {
            sick_id: body.sick_id,
            agent_name: body.agent_name,
            agent_image: body.agent_image || null,
            agent_description: body.agent_description || null,

        };
        model.agent.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.agent.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){       
        model.agent.update(dataNew,{
                where: {agent_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.agent.destroy({where:{agent_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}