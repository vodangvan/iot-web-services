var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.post_category.findAll({
            order: 'postcate_name ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.post_category.findAll({
            where:{ postcate_name: {$like: '%'+keyword + '%'}},
            order: 'postcate_name ASC'
        }).then(function(data){
            var dataList = {};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetAllName: function(done){
        model.post_category.findAll({
            attributes:['postcate_id', 'postcate_name'],
            order: 'postcate_name ASC'
        }).then(function(data){                
            return done(data);
        });
    },

    GetById: function(id, done){
        model.post_category.findOne({where: {postcate_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    MapPostCategory: function(body, done){        
        var dataNew = {
            postcate_name: body.postcate_name,
            postcate_picture: body.postcate_picture || null,
            postcate_description: body.postcate_description || null,
            postcate_createBy: body.postcate_createBy,
            postcate_createDate: body.postcate_createDate || null,
            postcate_updateBy: body.postcate_updateBy || null,
            postcate_updateDate: body.postcate_updateDate || null,
            postcate_isDelete: body.postcate_isDelete
        };
        model.post_category.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.post_category.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.post_category.update(dataNew,{
                where: {postcate_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.post_category.destroy({where:{postcate_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}