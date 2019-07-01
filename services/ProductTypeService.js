var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.product_type.findAll({
            order: 'prodtype_typeName ASC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.product_type.findAll({
            include: [
                {model: model.product_category, require: false, attributes: ['prodcate_name'], as: 'Product_Category'}
            ],
            where: { prodtype_typeName: {$like: '%'+ keyword + '%'}},
            order: 'prodtype_typeName ASC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.product_type.findOne({where: {prodtype_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByProductCategoryId: function(id, done){
        model.product_type.findAll({
            where: { prodcate_id: id},
            order: 'prodtype_typeName ASC'
        }).then(function(data){
            return done(data);
        });
    },

    MapProductType: function(body, done){        
        var dataNew = {
           prodcate_id: body.prodcate_id,
           prodtype_typeName: body.prodtype_typeName
        };
        model.product_type.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.product_type.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.product_type.update(dataNew,{
                where: {prodtype_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.product_type.destroy({where:{prodtype_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}