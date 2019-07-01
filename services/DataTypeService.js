var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.data_type.findAll({order: 'datatype_name ASC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.data_type.findAll({
            // include: [{ all: true }], 
            where: { datatype_name: {$like: '%'+ keyword + '%'}},
            order: 'datatype_name ASC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.data_type.findOne({where: {datatype_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetAllName: function(){
        var deferred = Q.defer();
        model.data_type.findAll({
             attributes: ['datatype_id']
        }).then(function(data){
            var arrData = [];
            var row = 0;
            data.forEach(function(item){
                row += 1;
                arrData.push(item.datatype_id);
                if(row == data.length){
                    deferred.resolve(arrData);
                }
            });
        });
        return deferred.promise;
    },

    CompareLimit: function(dataTypeId, value){
        var deferred = Q.defer();
        var dataResult ={
            flag: 0,
            datatype: null
        }
        model.data_type.findOne({
            where:{
                datatype_id: dataTypeId
            }
        }).then(function(data){
            if(data.datatype_minValue > value && data.datatype_minValue != null)
            {
                dataResult.flag = -1;
                dataResult.datatype = data;
                deferred.resolve(dataResult);
            }
            else if(data.datatype_maxValue < value && data.datatype_maxValue != null)
            {
                dataResult.flag = 1;
                dataResult.datatype = data;
                deferred.resolve(dataResult);
            }
            else 
            {
                dataResult.flag = 0;
                deferred.resolve(dataResult);
            }
        });
        return deferred.promise;
    },

    MapDataType: function(body, done){        
        var dataNew = {
            datatype_id : body.datatype_id,
            datatype_name: body.datatype_name,
            datatype_description: body.datatype_description || null,
            datatype_unit: body.datatype_unit,
            datatype_minValue: body.datatype_minValue,
            datatype_maxValue: body.datatype_maxValue
        };
        model.data_type.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.data_type.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        dataNew.datatype_id = id;
        model.data_type.update(dataNew,{
                where: {datatype_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Delete: function(obj, id, done){
         model.data_type.destroy({where:{datatype_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}