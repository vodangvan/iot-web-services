var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.answer_comment.findAll({
            order: 'anscom_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.answer_comment.findAll({
            where: { 
                    anscom_content: {$like: '%'+ keyword + '%'}           
            },
            order: 'anscom_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.answer_comment.findOne({where: {anscom_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByCommentId: function(id, done){
        model.answer_comment.findAll({
            where: { comment_id: id},
            order: 'anscom_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByEmailOrName: function(keyword, done){
        model.answer_comment.findAll({
            where: { 
                $or:[
                    {anscom_answreByName: {$like: '%'+ keyword + '%'}},
                    {anscom_answerByEmail: {$like: '%'+ keyword + '%'}}
                ]                
            },
            order: 'anscom_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapAnswerComment: function(body, done){        
        var dataNew = {
           anscom_content: body.anscom_content,
           anscom_date: body.anscom_date,
           anscom_answreByName: body.anscom_answreByName,
           anscom_answerByEmail: body.anscom_answerByEmail,
           comment_id: body.comment_id
        };
        model.answer_comment.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.answer_comment.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.answer_comment.update(dataNew,{
                where: {anscom_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.answer_comment.destroy({where:{anscom_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    DeleteByComment: function(commentId, done){
        model.answer_comment.destroy({
            where: {
                comment_id: commentId
            }
        }).then(function(data){
            return done(HttpStatus.OK, data);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}