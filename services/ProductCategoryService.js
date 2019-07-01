var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.product_category.findAll({
            order: 'prodcate_name ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.product_category.findAll({
            where:{ prodcate_name: {$like: '%'+keyword + '%'}},
            order: 'prodcate_name ASC'
        }).then(function(data){
            var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.product_category.findOne({where: {prodcate_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetAllName: function(done){
        model.product_category.findAll({
            attributes:['prodcate_id', 'prodcate_name'],
            order: 'prodcate_name ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    MapProductCategory: function(body, done){        
        var dataNew = {
            prodcate_name: body.prodcate_name,
            prodcate_image: body.prodcate_image || null,
            prodcate_description: body.prodcate_description || null,
            prodcate_createBy: body.prodcate_createBy,
            prodcate_createDate: body.prodcate_createDate || null,
            prodcate_updateBy: body.prodcate_updateBy || null,
            prodcate_updateDate: body.prodcate_updateDate || null,
            prodcate_isDelete: body.prodcate_isDelete
        };
        model.product_category.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.product_category.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.product_category.update(dataNew,{
                where: {prodcate_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.product_category.destroy({where:{prodcate_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}