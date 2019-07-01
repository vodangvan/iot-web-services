var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.comment.findAll({
            order: 'comment_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.comment.findAll({
            include: [
                {model: model.post, attributes: ['post_title'], as: 'Post'}
            ],
            where: { 
                    comment_content: {$like: '%'+ keyword + '%'}           
            },
            order: 'comment_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.comment.findOne({where: {comment_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByPostId: function(id, page = 0, pageSize, done){
        model.comment.findAll({
            include: [
                {model: model.answer_comment}
            ],
            where: { post_id: id},
            order: 'comment_id DESC'
        }).then(function(data){
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);          
        });
    },

    GetByEmailOrName: function(keyword, done){
        model.comment.findAll({
            where: { 
                $or:[
                    {comment_commentByName: {$like: '%'+ keyword + '%'}},
                    {comment_commentByEmail: {$like: '%'+ keyword + '%'}}
                ]                
            },
            order: 'comment_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetListCommentIdByPost:function(postId, done){
        model.comment.findAll({
            attributes: ['comment_id'],
            where:{
                post_id: post_id
            }
        }).then(function(data){
            return done(data);
        });
    },

    MapComment: function(body, done){        
        var dataNew = {
           comment_content: body.comment_content,
           comment_commentByName: body.comment_commentByName,
           comment_commentByEmail: body.comment_commentByEmail,
           comment_commentDate: body.comment_commentDate,
           post_id: body.post_id
        };
        model.comment.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.comment.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.comment.update(dataNew,{
                where: {comment_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.comment.destroy({where:{comment_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    DeleteByPost: function(postId, done){
        model.comment.destroy({
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