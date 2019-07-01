var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.config_type.findAll({order: 'configtype_name ASC'}).then(function(data){                
           return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.config_type.findAll({
            where: { configtype_name: {$like: '%'+ keyword + '%'}},
            order: 'configtype_name ASC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.config_type.findOne({where: {configtype_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetListByParentId: function(parentId, done){
        model.config_type.findAll({
            where: {configtype_parentId: parentId},
            order: 'configtype_order ASC'
        }).then(function(data){
            return done(data);
        });
    },

    GetCmdKeyWordById: function(id){
        var deferred = Q.defer();
        model.config_type.findOne({
            attributes: ['configtype_cmdKeyword'],
            where:{
                configtype_id: id
            }
        }).then(function(data){
            deferred.resolve(data)
        });
        return deferred.promise;
    },

    GetVariableById: function(id){
        var deferred = Q.defer();
        model.config_type.findOne({
            attributes: ['configtype_variable'],
            where:{
                configtype_id: id
            }
        }).then(function(data){
            deferred.resolve(data)
        });
        return deferred.promise;
    },

    MapConfigType: function(body, done){        
        var dataNew = {
            configtype_name: body.configtype_name,
            configtype_cmdKeyword: body.configtype_cmdKeyword,
            configtype_variable: body.configtype_variable || null,
            configtype_parentId: body.configtype_parentId || null,
            configtype_order: body.configtype_order,
            configtype_default: body.configtype_default,
            configtype_discription: body.configtype_discription
        };
        model.config_type.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.config_type.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.config_type.update(dataNew,{
                where: {
                    configtype_id: id
                }
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.config_type.destroy({where:{configtype_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}