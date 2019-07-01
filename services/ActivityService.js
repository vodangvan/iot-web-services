var model = require('../models');
var HttpStatus = require('http-status-codes');
var Q = require('q');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.activity.findAll({order: 'activity_id DESC'}).then(function(data){                
            return done(data);
            });
    },

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(userId, stockingId = 0, pondId = 0, actitypeId = 0, keyword, page = 0, pageSize, done){
        var deferred = Q.defer();
        var strQuery = "SELECT `activity`.* ";
        strQuery += " FROM (SELECT * FROM `user` AS u WHERE u.`user_id` = :userId ) AS `user` JOIN `pond` AS `pond` ON `user`.`user_id` = `pond`.`user_id` ";
        strQuery += " JOIN `activity` AS `activity` ON `pond`.`pond_id` = `activity`.`pond_id`";
        strQuery += " WHERE `activity`.`activity_note` LIKE :keyword";
        if(actitypeId > 0){
            strQuery += " AND `activity`.`actitype_id` = " + actitypeId;
        }
        if(stockingId > 0){
            strQuery += " AND `activity`.`stocking_id` = " + stockingId;
        }
        if(pondId > 0){
            strQuery += " AND `activity`.`pond_id` = " + pondId;
        }
        strQuery += " ORDER BY `activity`.`activity_date` DESC";
        model.sequelize.query(strQuery,{ replacements: { userId: userId, keyword: (keyword=="")?'%': '%'+keyword+'%' }, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            deferred.resolve(dataList);
        });
        return deferred.promise;
    },

    GetById: function(id, done){
        model.activity.findOne({where: {activity_id : id}}).then(function(data){                
            return done(data);
        });  
    },
    
    GetByPondId: function(id, done){
        model.activity.findAll({
            where: { pond_id: id},
            order: 'activity_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByPondDate: function(pondId, actitypeId, startDate, endDate, done){
        if(actitypeId == -1){
            model.activity.findAll({
                include:[
                    {
                        model: model.stocking_pond,
                        attributes:['pond_id'],
                        require: true,
                        include:[
                            {
                                model: model.pond,
                                attributes:['pond_description'],
                                require: true,
                                where:{
                                    pond_id: pondId
                                },
                                as: 'Pond'
                            }
                        ],
                        as: 'Stocking_Pond'
                    },
                    {model: model.activity_type, attributes:['actitype_name'], as: 'Activity_Type'}
                ],
                where: {
                    pond_id: pondId,
                    activity_date:{
                        $gte: startDate,
                        $lte: endDate
                    }
                },
                order: 'activity_id DESC'
            }).then(function(data){            
                return done(data);
            });
        }else{
            model.activity.findAll({
                include:[
                    {
                        model: model.stocking_pond,
                        attributes:['pond_id'],
                        require: true,
                        include:[
                            {
                                model: model.pond,
                                attributes:['pond_description'],
                                require: true,
                                where:{
                                    pond_id: pondId
                                },
                                as: 'Pond'
                            }
                        ],
                        as: 'Stocking_Pond'
                    },
                    {model: model.activity_type, attributes:['actitype_name'], as: 'Activity_Type'}
                ],
                where: {
                    pond_id: pondId,
                    activity_date:{
                        $gte: startDate,
                        $lte: endDate
                    },
                    actitype_id  : actitypeId
                },
                order: 'activity_id DESC'
            }).then(function(data){            
                return done(data);
            });
        }        
    },

    GetByActivityTypeId: function(id, done){
        model.activity.findAll({
            where: { actitype_id: id},
            order: 'activity_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapActivity: function(body, done){        
        var dataNew = {
           pond_id: body.pond_id,
           stocking_id: body.stocking_id,
           actitype_id: body.actitype_id,
           activity_date: body.activity_date,
           activity_note: body.activity_note
        };
        model.activity.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.activity.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.activity.update(dataNew,{
                where: {activity_id: id}
            }).then(function(data){                
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.activity.destroy({where:{activity_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}
