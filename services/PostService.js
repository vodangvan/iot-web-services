var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.post.findAll({
            order: 'post_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.post.findAll({
            include:[                        
                        {model: model.post_category, require: false, attributes: ['postcate_name'], as: 'Post_Category'},
                    ],
            where: { 
                post_title: {$like: '%'+ keyword + '%'}
            },
            order: 'post_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.post.findOne({where: {post_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByUserId: function(id, done){
        model.post.findAll({
            where: { user_id: id},
            order: 'post_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByPostCategoryId: function(id, done){
        model.post.findAll({
            where: { postcate_id: id},
            order: 'post_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapPost: function(body, done){        
        var dataNew = {
           user_id: body.user_id,
           postcate_id: body.postcate_id,
           post_title: body.post_title,
           post_smallPicture: body.post_smallPicture || null,
           post_description: body.post_description || null,
           post_updateDate: body.post_updateDate || null,
           post_updateBy: body.post_updateBy || null,
           post_content: body.post_content,
           post_isDelete: body.post_isDelete,
           post_createDate: body.post_createDate,
           post_createBy: body.post_createBy,
           post_isPublic: body.post_isPublic
        };
        model.post.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.post.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.post.update(dataNew,{
                where: {post_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.post.destroy({where:{post_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}