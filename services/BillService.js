var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.bill.findAll({
            order: 'bill_dateInBill DESC'
        }).then(function(data){                
            return done(data);
        });
    },    

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(userId, stockingId = 0, keyword = '', page = 0, pageSize, done){
        if(stockingId == 0){
            model.bill.findAll({  
                where:{                    
                    user_id: userId
                },       
                order: 'bill_id DESC' 
            }).then(function(data){
                var dataList={};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
            });
        }else{
            model.bill.findAll({  
                where:{
                    user_id: userId,
                    stocking_id: stockingId,
                },
                order: 'bill_id DESC' 
            }).then(function(data){
                var dataList={};
                dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
                dataList.totalRow = data.length;
                return done(dataList);            
            });
        }        
    },

    GetById: function(id, done){
        model.bill.findOne({where: {bill_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByUserId: function(id, done){
        model.bill.findAll({
            where: { user_id: id},
            order: 'bill_dateInBill DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetByStockingId: function(id, done){
        model.bill.findAll({
            where: { stocking_id: id},
            order: 'bill_dateInBill DESC'
        }).then(function(data){
            return done(data);
        });
    },

    MapBill: function(body, done){        
        var dataNew = {
           user_id: body.user_id,
           stocking_id: body.stocking_id,
           bill_createDate: body.bill_createDate,
           bill_total: body.bill_total,
           bill_dateInBill: body.bill_dateInBill
        };
        model.bill.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },

    Add: function(dataNew, done){
        model.bill.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    Update: function(dataNew, id, done){
        model.bill.update(dataNew,{
            where: {bill_id: id}
        }).then(function(data){
            return done(HttpStatus.OK, dataNew);
        }).catch(function(error){
            return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    UpdateTotal: function(billId, done){
        var strQuery = 'SELECT SUM(IFNULL(o.`other_price`, 0)* IFNULL(o.`other_quantity`, 0)) + SUM( IFNULL(s.`seed_price`, 0) * IFNULL(s.`seed_quantity`, 0)) + SUM(IFNULL(m.`material_price`,0) * IFNULL(m.`material_quantity`, 0)) AS `total` ';
        strQuery    += 'FROM (SELECT bill.* FROM `bill` AS bill WHERE bill.`bill_id` = :bill_id) AS b LEFT JOIN `other` AS o ON b.`bill_id` = o.`bill_id` '
        strQuery    += ' LEFT JOIN `seed` AS s ON b.`bill_id` = s.`bill_id` LEFT JOIN `material` AS m ON b.`bill_id` = m.`bill_id`';
        model.sequelize.query(strQuery,{ replacements: { bill_id: billId  }, type: model.sequelize.QueryTypes.SELECT })
        .then(function(data) {
            model.bill.update({
                bill_total: data[0].total
            }, {
                where: {bill_id: billId}
            }).then(function(data){
                return done(HttpStatus.OK, data);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
            });
        });
    },

    Delete: function(obj, id, done){
         model.bill.destroy({where:{bill_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}