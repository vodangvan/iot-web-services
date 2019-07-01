var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.feedback.findAll({
            order: 'feedback_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(keyword = '', page = 0, pageSize, done){
        model.feedback.findAll({
            where: { 
                $or:[
                    {feedback_name: {$like: '%'+ keyword + '%'}},
                    {feedback_email: {$like: '%'+ keyword + '%'}}
                ]            
            },
            order: 'feedback_status ASC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.feedback.findOne({where: {feedback_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    CountFeedbackStatus: function(status, done){
        model.feedback.count({
            where: {
                feedback_status: status
            }
        }).then(function(dataCount){
            return done(dataCount);
        });
    },

    GetByUserId: function(id, done){
        model.feedback.findAll({
            where: { user_id: id},
            order: 'feedback_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapFeedback: function(body, done){        
        var dataNew = {
           user_id: body.user_id || null,
           feedback_name: body.feedback_name,
           feedback_email: body.feedback_email,
           feedback_message: body.feedback_message,
           feedback_createDate: body.feedback_createDate,
           feedback_status: body.feedback_status,
           feedback_answerContent: body.feedback_answerContent || null,
           feedback_answerDate: body.feedback_answerDate || null
        };
        model.feedback.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.feedback.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.feedback.update(dataNew,{
                where: {feedback_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.feedback.destroy({where:{feedback_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}