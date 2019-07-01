var model = require('../models');
var HttpStatus = require('http-status-codes');

module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.media.findAll({
            order: 'media_tittle DESC'
        }).then(function(data){                
            return done(data);
        });
    },    


    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.media.findAll({
            where: { 
                media_tittle: {$like: '%'+ keyword + '%'}           
            },
            order: 'media_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.media.findOne({where: {media_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByPostId: function(id, done){
        model.media.findAll({
            where: { post_id: id},
            order: 'media_id ASC'
        }).then(function(data){
            return done(data);
        });
    },

    //Lấy danh sách theo loại tập tin
    //type: 0: hình ảnh, 1: video, null: khác
    GetByMediaType: function(type, done){
        model.media.findAll({
            where: { 
                media_type: type      
            },
            order: 'media_id DESC'
        }).then(function(data){
            return done(data);
        });
    },
    //Lấy danh sách theo bài viết và loại tập tin
    //type: 0: hình ảnh, 1: video, null: khác
    GetByPostAndType: function(id, type, done){
        model.media.findAll({
            where: { 
                post_id: id,
                media_type: type
            },
            order: 'media_id ASC'
        }).then(function(data){
            return done(data);
        });
    },

    MapMedia: function(body, done){        
        var dataNew = {
           media_tittle: body.media_tittle,
           media_link: body.media_link,
           post_id: body.post_id,
           media_type: body.media_type
        };
        model.media.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.media.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.media.update(dataNew,{
                where: {media_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.media.destroy({where:{media_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    DeleteByPost: function(postId, done){
        model.media.destroy({
            where: {
                post_id: postId
            }
        }).then(function(data){
            return done(HttpStatus.OK, data);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }
}