var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.activity_material.findAll({order: 'activity_id ASC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.activity_material.findAll({
            order: 'activity_id ASC'
    }).then(function(data){
        var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(activityId, materialId, done){
        model.activity_material.findOne({where: {activity_id : activityId, material_id: materialId}}).then(function(data){                
            return done(data);
        });  
    },
    
    GetByActivityId: function(id, done){
        model.activity_material.findAll({
            where: { activity_id: id},
            order: 'activity_id ASC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByMaterialId: function(id, done){
        model.activity_material.findAll({
            where: { material_id: id},
            order: 'material_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapActivityMaterial: function(body, done){        
        var dataNew = {
           material_id: body.material_id,
           activity_id: body.activity_id,
           actimaterial_amount: body.actimaterial_amount
        };
        model.activity_material.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    MapActivityMaterialMulti: function(dataArr, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        dataArr.forEach(function(element) {
            var dataNew = {
                material_id: element.material_id,
                activity_id: element.activity_id,
                actimaterial_amount: element.actimaterial_amount
            };
            model.activity_material.build(dataNew).validate().then(function(error){
                if(error){
                    result.arrError.push(error);
                }                    
                else{
                    result.arrData.push(dataNew);
                }     
                result.lastRow +=1;
                if(result.lastRow == dataArr.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        }); 
    },

    Add: function(dataNew, done){
        model.activity_material.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    AddMulti: function(arrDataNew, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        arrDataNew.forEach(function(dataElement){
            model.activity_material.create(dataElement).then(function (data) {
                result.arrData.push(data);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            }).catch(function(error){
                result.arrError.push(error);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        });        
    },

    Update: function(dataNew, activityId, materialId, done){
        model.activity_material.update(dataNew,{
                where: {
                    activity_id : activityId, 
                    material_id: materialId
                }
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, activityId, materialId, done){
         model.activity_material.destroy({
            where: {
                activity_id : activityId, 
                material_id: materialId
            }
         }).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}