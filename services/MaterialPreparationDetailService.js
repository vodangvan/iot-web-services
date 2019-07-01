var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.material_preparation_detail.findAll({order: 'pondpreparation_id DESC'}).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.material_preparation_detail.findAll({
            order: 'pondpreparation_id DESC'
    }).then(function(data){
        var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetDetail: function(pondpreparationId, materialId, done){
        model.material_preparation_detail.findOne({
            where: {
                pondpreparation_id : pondpreparationId,
                material_id: materialId
            }
        }).then(function(data){                
            return done(data);
        });  
    },
    
    GetByPondPreparationId: function(id, done){
        model.material_preparation_detail.findAll({
            where: { pondpreparation_id: id},
            order: 'material_id ASC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByMaterialId: function(id, done){
        model.material_preparation_detail.findAll({
            where: { material_id: id},
            order: 'pondpreparation_id DESC'
        }).then(function(data){
            return done(data);
        });
    },
    GetMaxNumber: function(pondPreID, materialId, done){
        model.material_preparation_detail.max('matepredetail_number',{
            where: {
                pondpreparation_id: pondPreID,
                material_id: materialId
            }
        }).then(function(maxData) {
            return done(maxData);
        });
    },

    MapMaterialPreparationDetail: function(body, done){        
        var dataNew = {
           pondpreparation_id: body.pondpreparation_id,
           material_id: body.material_id,
           matepredetail_number: body.matepredetail_number,
           matepredetail_quantity: body.matepredetail_quantity,
           matepredetail_date: body.matepredetail_date,
           matepredetail_note: body.matepredetail_note || null,
        };
        model.material_preparation_detail.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.material_preparation_detail.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },  

    Update: function(dataNew, pondpreparationId, materialId, done){
        model.material_preparation_detail.update(dataNew,{
                where: {
                    pondpreparation_id : pondpreparationId, 
                    material_id: materialId
                }
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, pondpreparationId, materialId, done){
         model.material_preparation_detail.destroy({
            where: {
                pondpreparation_id : pondpreparationId,
                material_id: materialId
            }
         }).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}