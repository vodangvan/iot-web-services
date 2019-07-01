var model = require('../models');
var HttpStatus = require('http-status-codes');
module.exports = {
    //Lấy tất cả dữ liệu
    GetAll: function(done){
        model.seed.findAll({
            order: 'seed_id DESC'
        }).then(function(data){                
            return done(data);
        });
    },     

    //Lấy dữ liệu theo keyword
    GetAllByKeyword: function(userId, stockingId, keyword = '', page = 0, pageSize, done){
        model.seed.findAll({
            where:{
                seed_numberOfLot: {$like: '%'+ keyword + '%'},
                $or:[
                    { user_id: userId },
                    { stocking_id: stockingId }
                ]
            },
            order: 'seed_id DESC'
    }).then(function(data){
        var dataList={};
            dataList = data.slice(parseInt(page)* parseInt(pageSize), parseInt(page)*parseInt(pageSize) + parseInt(pageSize));
            dataList.totalRow = data.length;
            return done(dataList);            
        });
    },

    GetById: function(id, done){
        model.seed.findOne({where: {seed_id : id}}).then(function(data){                
            return done(data);
        });  
    },

    GetByBillId: function(id, done){
        model.seed.findAll({
            where: { bill_id: id},
            order: 'seed_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetBySeedQualityId: function(id, done){
        model.seed.findAll({
            where: { seedquality_id: id},
            order: 'seed_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    GetListBySeedAndBill: function(billId, seedqualityId, done){
        model.seed.findAll({
            where: { 
                bill_id: billId,
                seedquality_id: seedqualityId
            },
            order: 'seed_id DESC'
        }).then(function(data){
            return done(data);
        });
    },

    //Nối các bảng User, Bill, Stocking, Seed với nhau, lấy ra danh sách seed theo userId và stockingId truyền vào
    //Trả về là một mảng đối tượng các seed trong callback
    GetListByUserAndStocking: function(userId, stockingId, done){
        var strQuery = "SELECT s.* ";
        strQuery += " FROM `user` AS u JOIN `bill` as b ON u.`user_id` = b.`user_id` AND u.`user_id` = :userId";
        strQuery += " JOIN `stocking` AS stk ON b.`stocking_id` = stk.`stocking_id` AND stk.`stocking_id` = :stockingId";
        strQuery += " JOIN `seed` AS s ON b.`bill_id` = s.`bill_id`;";
        model.sequelize.query(strQuery, { replacements: {userId: userId, stockingId: stockingId}, type: model.sequelize.QueryTypes.SELECT})
        .then(function(data){
            return done(data);
        });
    },

    MapSeed: function(body, done){    
        
        var dataNew = {
           bill_id: body.bill_id,
           seedquality_id: body.seedquality_id,
           seed_numberOfLot: body.seed_numberOfLot,
           seed_quantity: body.seed_quantity,
           seed_existence: body.seed_existence,
           seed_price: body.seed_price,
           seed_source: body.seed_source,
           seed_size: body.seed_size,
        };
        model.seed.build(dataNew).validate().then(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);         
            else{
                return done(HttpStatus.OK, dataNew);                    
            }     
        });
    },
    
    MapSeedArray: function(body, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        body.seeds.forEach(function(element) {
            var dataNew = {
                bill_id: body.bill_id,
                seedquality_id: element.seedquality_id,
                seed_numberOfLot: element.seed_numberOfLot,
                seed_quantity: element.seed_quantity,
                seed_existence: element.seed_existence || 0,
                seed_price: element.seed_price,
                seed_source: element.seed_source,
                seed_size: element.seed_size,
            };
            model.seed.build(dataNew).validate().then(function(error){
                if(error){
                    result.arrError.push(error);
                }                    
                else{
                    result.arrData.push(dataNew);
                }     
                result.lastRow +=1;
                if(result.lastRow == body.seeds.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        }); 
    },

    Add: function(dataNew, done){
        model.seed.create(dataNew).then(function (data) {
            return done(HttpStatus.CREATED, data);        
        }).catch(function(error){
            if(error)
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },

    AddMulti: function(arrDataNew, done){
        var result ={
            arrData: [],
            arrError: [],
            lastRow: 0
        }
        arrDataNew.forEach(function(dataElement){
            model.seed.create(dataElement).then(function (data) {
                result.arrData.push(data);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            }).catch(function(error){
                result.arrError.push(error);
                result.lastRow +=1;
                if(result.lastRow == arrDataNew.length){
                    if(result.arrError.length > 0){
                        return done(HttpStatus.BAD_REQUEST, result.arrError);
                    }else{
                        return done(HttpStatus.OK, result.arrData);
                    }
                }
            });
        });        
    },

    Update: function(dataNew, id, done){
        model.seed.update(dataNew,{
                where: {seed_id: id}
            }).then(function(data){
                return done(HttpStatus.OK, dataNew);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    },
    Delete: function(obj, id, done){
         model.seed.destroy({where:{seed_id: id}}).then(function(data){
            return done(HttpStatus.OK, obj);
            }).catch(function(error){
                return done(HttpStatus.BAD_REQUEST, error);
        });
    }
    
}